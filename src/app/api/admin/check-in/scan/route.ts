import { NextResponse } from "next/server";
import { AuthError, authorize } from "@/lib/auth/permissions";
import { audit } from "@/lib/audit";
import { parseQrPayload } from "@/lib/qr/tokens";
import { checkInByToken } from "@/services/checkin.service";

export async function POST(request: Request) {
  try {
    const session = await authorize("check_in");
    const body = (await request.json()) as { payload?: string };
    const token = body.payload ? parseQrPayload(body.payload) : null;
    if (!token) {
      return NextResponse.json({ status: "invalid" });
    }
    const result = await checkInByToken(token, session.id);
    if (result.status === "admitted") {
      await audit({
        userId: session.id,
        action: "checkin.scan",
        entityType: "guest",
        entityId: result.guest.id,
      });
    }
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("scan failed", err);
    return NextResponse.json({ error: "Scan failed" }, { status: 500 });
  }
}
