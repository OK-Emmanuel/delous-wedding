import { NextResponse } from "next/server";
import { AuthError, authorize } from "@/lib/auth/permissions";
import { audit } from "@/lib/audit";
import { registerOnSpot } from "@/services/checkin.service";

export async function POST(request: Request) {
  try {
    const session = await authorize("check_in");
    const body = (await request.json()) as {
      fullName?: string;
      phone?: string;
      groupId?: number | null;
      autoCheckIn?: boolean;
    };
    if (!body.fullName || body.fullName.trim().length < 2) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }
    const result = await registerOnSpot(
      {
        fullName: body.fullName,
        phone: body.phone,
        groupId: body.groupId ?? null,
        autoCheckIn: body.autoCheckIn ?? true,
      },
      session.id,
    );
    await audit({
      userId: session.id,
      action: "checkin.register_onspot",
      entityType: "guest",
      entityId: result.guestId,
      detail: { fullName: body.fullName, autoCheckIn: body.autoCheckIn ?? true },
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("on-spot registration failed", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
