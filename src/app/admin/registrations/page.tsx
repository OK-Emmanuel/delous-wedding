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
  StatCard,
  btnPrimary,
  inputCls,
} from "@/components/admin/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import { FilterIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

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

  const [rows, [{ count }], stats] = await Promise.all([
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
    db
      .select({
        total: sql<number>`count(*)::int`,
        definitely: sql<number>`count(*) filter (where ${registrations.attendanceResponse} = 'definitely')::int`,
        likely: sql<number>`count(*) filter (where ${registrations.attendanceResponse} = 'likely')::int`,
        declined: sql<number>`count(*) filter (where ${registrations.attendanceResponse} = 'declined')::int`,
      })
      .from(registrations),
  ]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const counts = stats[0] ?? { total: 0, definitely: 0, likely: 0, declined: 0 };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registration Records"
        description={`${count.toLocaleString()} registration form submission${count === 1 ? "" : "s"} logged in database.`}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Submitted" value={counts.total} accent="burgundy" />
        <StatCard label="Definitely Attending" value={counts.definitely} accent="emerald" />
        <StatCard label="Likely Attending" value={counts.likely} accent="gold" />
        <StatCard label="Declined" value={counts.declined} accent="slate" />
      </div>

      {/* Filter Toolbar */}
      <form
        method="GET"
        className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs"
      >
        <div className="flex-1 min-w-[220px]">
          <select
            name="attendance"
            defaultValue={params.attendance ?? ""}
            className={inputCls}
          >
            <option value="">All attendance responses</option>
            {ATTENDANCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className={btnPrimary}>
          <HugeiconsIcon icon={FilterIcon} size={14} />
          <span>Filter Records</span>
        </button>
        {params.attendance && (
          <Link
            href="/admin/registrations"
            className="rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition"
          >
            Clear Filter
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <EmptyState
          title="No registration submissions found"
          description="Submissions from the public registration portal will show here automatically."
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-100 bg-zinc-50/75 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-5 py-3.5">Guest & Attendee Code</th>
                    <th className="px-4 py-3.5">Relationship</th>
                    <th className="px-4 py-3.5">Invited By</th>
                    <th className="px-4 py-3.5">RSVP Response</th>
                    <th className="px-4 py-3.5">Guest Status</th>
                    <th className="px-5 py-3.5 text-right">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {rows.map((r) => (
                    <tr key={r.id} className="group hover:bg-zinc-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/guests/${r.guestId}`}
                          className="font-semibold text-zinc-900 group-hover:text-burgundy transition"
                        >
                          {r.fullName}
                        </Link>
                        <p className="font-mono text-[11px] text-zinc-400 mt-0.5">
                          {r.attendeeCode ?? "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-700">
                        {r.relationship ? RELATIONSHIP_LABELS[r.relationship] : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-zinc-600 font-medium">
                        {r.invitedBy ?? "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        {r.attendanceResponse ? (
                          <Badge
                            value={r.attendanceResponse}
                            label={ATTENDANCE_LABELS[r.attendanceResponse]}
                          />
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge value={r.guestStatus} />
                      </td>
                      <td className="px-5 py-3.5 text-right font-normal text-zinc-500">
                        {r.createdAt.toLocaleString("en-GB", {
                          timeZone: "Africa/Lagos",
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {rows.map((r) => (
              <Link
                key={r.id}
                href={`/admin/guests/${r.guestId}`}
                className="block rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs hover:border-zinc-300 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900">
                      {r.fullName}
                    </h3>
                    <p className="font-mono text-xs text-zinc-400 mt-0.5">
                      {r.attendeeCode ?? "No code"}
                    </p>
                  </div>
                  <Badge value={r.guestStatus} />
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {r.attendanceResponse && (
                    <Badge
                      value={r.attendanceResponse}
                      label={ATTENDANCE_LABELS[r.attendanceResponse]}
                    />
                  )}
                  {r.relationship && (
                    <span className="rounded bg-zinc-100 px-2 py-0.5 text-zinc-700 font-medium">
                      {RELATIONSHIP_LABELS[r.relationship]}
                    </span>
                  )}
                </div>

                <div className="mt-2.5 flex items-center justify-between border-t border-zinc-100 pt-2 text-[11px] text-zinc-400">
                  <span>Invited by: {r.invitedBy ?? "—"}</span>
                  <span>
                    {r.createdAt.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </div>
              </Link>
            ))}
          </div>

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
      )}
    </div>
  );
}
