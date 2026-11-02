import { NextResponse } from "next/server";
import { and, isNotNull, ne, sql } from "drizzle-orm";
import { db } from "@/db";
import { guests, verificationCodes } from "@/db/schema";
import { normalizePhone } from "@/lib/constants";
import { generateOtp, hashToken } from "@/lib/qr/tokens";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { enqueueAndSend } from "@/lib/email/outbox";
import { otpEmail } from "@/lib/email/templates";

/**
 * Step 1 of ticket recovery (PRD §6.3): send a one-time code.
 * Never reveals whether a record exists.
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit(`recover:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly." },
      { status: 429 },
    );
  }

  let body: { identifier?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const identifier = body.identifier?.trim() ?? "";
  if (identifier.length < 5) {
    return NextResponse.json({ error: "Enter your registered email or phone" }, { status: 400 });
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

  // Issue the code only when a matching guest with an email exists —
  // but always return the same response.
  if (guest?.email) {
    const code = generateOtp();
    await db.insert(verificationCodes).values({
      guestId: guest.id,
      codeHash: hashToken(code),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
    const mail = otpEmail({ name: guest.fullName.split(" ")[0], code });
    await enqueueAndSend({
      guestId: guest.id,
      toEmail: guest.email,
      template: "otp",
      subject: mail.subject,
      html: mail.html,
      idempotencyKey: `otp:${guest.id}:${hashToken(code).slice(0, 12)}`,
    });
  }

  return NextResponse.json({
    ok: true,
    message:
      "If your details match a registration, a verification code has been sent to the registered email address.",
  });
}
