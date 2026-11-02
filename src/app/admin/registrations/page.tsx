import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { guests, registrations } from "@/db/schema";
import { requirePermission } from "@/lib/auth/permissions";
import {
  ATTENDANCE_LABELS,
  ATTENDANCE_OPTIONS,
  RELATIONSHIP_LABELS,
} from "@/lib/constants";
import {
  Badge,
  EmptyState,
  PageHeader,
  Pagination,
  btnPrimary,
  inputCls,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function RegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ attendance?: string; page?: string }>;
}) {
  await requirePermission("manage_guests");
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const where = params.attendance
    ? eq(
        registrations.attendanceResponse,
        params.attendance as (typeof registrations.attendanceResponse.enumValues)[number],
      )
    : undefined;

  const [rows, [{ count }]] = await Promise.all([
    db
      .select({
        id: registrations.id,
        guestId: registrations.guestId,
        relationship: registrations.relationship,
        invitedBy: registrations.invitedBy,
        attendanceResponse: registrations.attendanceResponse,
        createdAt: registrations.createdAt,
        fullName: guests.fullName,
        attendeeCode: guests.attendeeCode,
        guestStatus: guests.status,
      })
      .from(registrations)
      .innerJoin(guests, eq(guests.id, registrations.guestId))
      .where(where)
      .orderBy(desc(registrations.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(registrations)
      .where(where),
  ]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  return (
    <>
      <PageHeader
        title="Registrations"
        description={`${count} registration${count === 1 ? "" : "s"} submitted`}
      />

      <form method="GET" className="mb-4 flex gap-3">
        <select
          name="attendance"
          defaultValue={params.attendance ?? ""}
          className={`${inputCls} max-w-xs`}
        >
          <option value="">All attendance responses</option>
          {ATTENDANCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <button className={btnPrimary}>Filter</button>
      </form>

      {rows.length === 0 ? (
        <EmptyState title="No registrations yet" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Relationship</th>
                <th className="px-4 py-3">Invited by</th>
                <th className="px-4 py-3">Attendance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/guests/${r.guestId}`}
                      className="font-medium text-burgundy hover:underline"
                    >
                      {r.fullName}
                    </Link>
                    <p className="text-xs text-slate-400">{r.attendeeCode}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {r.relationship ? RELATIONSHIP_LABELS[r.relationship] : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.invitedBy ?? "—"}</td>
                  <td className="px-4 py-3">
                    {r.attendanceResponse ? (
                      <Badge
                        value={r.attendanceResponse}
                        label={ATTENDANCE_LABELS[r.attendanceResponse]}
                      />
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge value={r.guestStatus} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {r.createdAt.toLocaleString("en-GB", {
                      timeZone: "Africa/Lagos",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination
        page={page}
        totalPages={totalPages}
        makeHref={(p) =>
          `/admin/registrations?${new URLSearchParams({
            ...(params.attendance ? { attendance: params.attendance } : {}),
            page: String(p),
          })}`
        }
      />
    </>
  );
}
