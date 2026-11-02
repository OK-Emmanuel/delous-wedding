import { NextResponse } from "next/server";
import { AuthError, authorize } from "@/lib/auth/permissions";
import { searchAttendees } from "@/services/checkin.service";

export async function GET(request: Request) {
  try {
    await authorize("check_in");
    const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
    if (q.length < 2) return NextResponse.json({ results: [] });
    const results = await searchAttendees(q, 10);
    return NextResponse.json({ results });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("search failed", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
