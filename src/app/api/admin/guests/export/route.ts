import { and, eq, ilike, isNotNull, isNull, or, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { checkIns, guests, invitationGroups, registrations } from "@/db/schema";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { ATTENDANCE_LABELS, GUEST_STATUS_LABELS } from "@/lib/constants";

function csvEscape(value: unknown): string {
  const s = value == null ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || !hasPermission(session.role, "export_records")) {
    return new Response("Forbidden", { status: 403 });
  }

  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams);

  const conditions: SQL[] = [];
  if (params.q) {
    const q = `%${params.q.trim()}%`;
    conditions.push(
      or(
        ilike(guests.fullName, q),
        ilike(guests.attendeeCode, q),
        ilike(guests.email, q),
        ilike(guests.phone, q),
      )!,
    );
  }
  if (params.group) conditions.push(eq(guests.groupId, Number(params.group)));
  if (params.status)
    conditions.push(
      eq(guests.status, params.status as (typeof guests.status.enumValues)[number]),
    );
  if (params.attendance)
    conditions.push(
      eq(
        registrations.attendanceResponse,
        params.attendance as (typeof registrations.attendanceResponse.enumValues)[number],
      ),
    );
  if (params.checkin === "yes") conditions.push(isNotNull(checkIns.id));
  if (params.checkin === "no") conditions.push(isNull(checkIns.id));

  const rows = await db
    .select({
      attendeeCode: guests.attendeeCode,
      fullName: guests.fullName,
      email: guests.email,
      phone: guests.phone,
      groupName: invitationGroups.name,
      status: guests.status,
      source: guests.source,
      invitedBy: guests.invitedBy,
      attendanceResponse: registrations.attendanceResponse,
      checkedInAt: checkIns.checkedInAt,
      createdAt: guests.createdAt,
    })
    .from(guests)
    .leftJoin(invitationGroups, eq(guests.groupId, invitationGroups.id))
    .leftJoin(registrations, eq(registrations.guestId, guests.id))
    .leftJoin(checkIns, eq(checkIns.guestId, guests.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(guests.fullName);

  const header =
    "Attendee ID,Full Name,Email,Phone,Group,Status,Source,Invited By,Attendance,Checked In At,Registered At";
  const lines = rows.map((r) =>
    [
      r.attendeeCode,
      r.fullName,
      r.email,
      r.phone,
      r.groupName,
      GUEST_STATUS_LABELS[r.status] ?? r.status,
      r.source,
      r.invitedBy,
      r.attendanceResponse ? ATTENDANCE_LABELS[r.attendanceResponse] : "",
      r.checkedInAt?.toISOString() ?? "",
      r.createdAt.toISOString(),
    ]
      .map(csvEscape)
      .join(","),
  );

  return new Response([header, ...lines].join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="delous26-guests-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
