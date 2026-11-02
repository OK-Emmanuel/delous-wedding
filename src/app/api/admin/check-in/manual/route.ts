import { NextResponse } from "next/server";
import { AuthError, authorize } from "@/lib/auth/permissions";
import { audit } from "@/lib/audit";
import { checkInManually } from "@/services/checkin.service";

export async function POST(request: Request) {
  try {
    const session = await authorize("check_in");
    const body = (await request.json()) as { guestId?: number };
    if (!body.guestId) {
      return NextResponse.json({ error: "guestId required" }, { status: 400 });
    }
    const result = await checkInManually(body.guestId, session.id);
    if (result.status === "admitted") {
      await audit({
        userId: session.id,
        action: "checkin.manual",
        entityType: "guest",
        entityId: body.guestId,
      });
    }
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("manual check-in failed", err);
    return NextResponse.json({ error: "Check-in failed" }, { status: 500 });
  }
}
