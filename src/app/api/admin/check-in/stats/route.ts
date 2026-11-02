import { NextResponse } from "next/server";
import { AuthError, authorize } from "@/lib/auth/permissions";
import { checkInStats, recentCheckIns } from "@/services/checkin.service";

export async function GET() {
  try {
    await authorize("check_in");
    const [stats, recent] = await Promise.all([checkInStats(), recentCheckIns(25)]);
    return NextResponse.json({ stats, recent });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("stats failed", err);
    return NextResponse.json({ error: "Stats failed" }, { status: 500 });
  }
}
