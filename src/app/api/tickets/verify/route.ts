import { NextResponse } from "next/server";
import { and, desc, eq, gt, isNull, ne, sql, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { guests, verificationCodes } from "@/db/schema";
import { normalizePhone } from "@/lib/constants";
import { hashToken } from "@/lib/qr/tokens";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { reissueTicket } from "@/services/registration.service";

/**
 * Step 2 of ticket recovery: verify the one-time code, rotate the ticket
 * (the lost one becomes invalid) and hand back a fresh invitation link.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit(`verify:${ip}`, { limit: 10, windowMs: 15 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly." },
      { status: 429 },
    );
  }

  let body: { identifier?: string; code?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const identifier = body.identifier?.trim() ?? "";
  const code = body.code?.trim() ?? "";
  if (!/^\d{6}$/.test(code) || identifier.length < 5) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  const phoneNorm = normalizePhone(identifier);
  const guest = await db.query.guests.findFirst({
    where: and(
      ne(guests.status, "revoked"),
      identifier.includes("@")
        ? sql`lower(${guests.email}) = ${identifier.toLowerCase()}`
        : and(isNotNull(guests.phoneNormalized), sql`${guests.phoneNormalized} = ${phoneNorm}`),
    ),
  });
  if (!guest) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  const [record] = await db
    .select()
    .from(verificationCodes)
    .where(
      and(
        eq(verificationCodes.guestId, guest.id),
        eq(verificationCodes.codeHash, hashToken(code)),
        gt(verificationCodes.expiresAt, new Date()),
        isNull(verificationCodes.usedAt),
      ),
    )
    .orderBy(desc(verificationCodes.createdAt))
    .limit(1);

  if (!record) {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
  }

  await db
    .update(verificationCodes)
    .set({ usedAt: new Date() })
    .where(eq(verificationCodes.id, record.id));

  const token = await reissueTicket(guest.id);
  return NextResponse.json({ ok: true, url: `/invitation/${token}` });
}
