import { NextResponse } from "next/server";
import { AuthError, authorize } from "@/lib/auth/permissions";
import { audit } from "@/lib/audit";
import { undoCheckIn } from "@/services/checkin.service";

export async function POST(request: Request) {
  try {
    const session = await authorize("check_in");
    const body = (await request.json()) as { guestId?: number };
    if (!body.guestId) {
      return NextResponse.json({ error: "guestId required" }, { status: 400 });
    }
    const ok = await undoCheckIn(body.guestId);
    if (!ok) {
      return NextResponse.json(
        { error: "Guest was not checked in" },
        { status: 400 },
      );
    }
    await audit({
      userId: session.id,
      action: "checkin.undo",
      entityType: "guest",
      entityId: body.guestId,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("undo failed", err);
    return NextResponse.json({ error: "Undo failed" }, { status: 500 });
  }
}
