import Link from "next/link";
import { and, asc, desc, eq, ilike, isNotNull, isNull, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { checkIns, guests, invitationGroups, registrations } from "@/db/schema";
import { requirePermission } from "@/lib/auth/permissions";
import {
  ATTENDANCE_LABELS,
  ATTENDANCE_OPTIONS,
  GUEST_STATUS_LABELS,
} from "@/lib/constants";
import {
  Badge,
  EmptyState,
  PageHeader,
  Pagination,
  btnPrimary,
  btnSecondary,
  inputCls,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type Search = {
  q?: string;
  group?: string;
  status?: string;
  attendance?: string;
  checkin?: string;
  sort?: string;
  page?: string;
};

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requirePermission("manage_guests");
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

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

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const orderBy =
    params.sort === "oldest"
      ? asc(guests.createdAt)
      : params.sort === "name"
        ? asc(guests.fullName)
        : desc(guests.createdAt);

  const baseQuery = db
    .select({
      id: guests.id,
      attendeeCode: guests.attendeeCode,
      fullName: guests.fullName,
      email: guests.email,
      phone: guests.phone,
      status: guests.status,
      source: guests.source,
      createdAt: guests.createdAt,
      groupName: invitationGroups.name,
      attendanceResponse: registrations.attendanceResponse,
      checkedInAt: checkIns.checkedInAt,
    })
    .from(guests)
    .leftJoin(invitationGroups, eq(guests.groupId, invitationGroups.id))
    .leftJoin(registrations, eq(registrations.guestId, guests.id))
    .leftJoin(checkIns, eq(checkIns.guestId, guests.id));

  const [rows, [{ count }], groups] = await Promise.all([
    baseQuery
      .where(where)
      .orderBy(orderBy)
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(guests)
      .leftJoin(registrations, eq(registrations.guestId, guests.id))
      .leftJoin(checkIns, eq(checkIns.guestId, guests.id))
      .where(where),
    db.query.invitationGroups.findMany({ orderBy: [asc(invitationGroups.name)] }),
  ]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const exportQs = new URLSearchParams(
    Object.entries(params).filter(([k, v]) => v && k !== "page") as [string, string][],
  ).toString();

  const makeHref = (p: number) => {
    const qs = new URLSearchParams(
      Object.entries({ ...params, page: String(p) }).filter(([, v]) => v) as [
        string,
        string,
      ][],
    );
    return `/admin/guests?${qs}`;
  };

  return (
    <>
      <PageHeader
        title="Guests"
        description={`${count} guest${count === 1 ? "" : "s"} matching your filters`}
        action={
          <div className="flex gap-2">
            <a href={`/api/admin/guests/export?${exportQs}`} className={btnSecondary}>
              Export CSV
            </a>
            <Link href="/admin/guests/import" className={btnSecondary}>
              Import CSV
            </Link>
            <Link href="/admin/guests/new" className={btnPrimary}>
              + Add Guest
            </Link>
          </div>
        }
      />

      {/* Filters */}
      <form
        method="GET"
        className="mb-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-6"
      >
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Search name, ID, email, phone…"
          className={`${inputCls} col-span-2`}
        />
        <select name="group" defaultValue={params.group ?? ""} className={inputCls}>
          <option value="">All groups</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={params.status ?? ""} className={inputCls}>
          <option value="">All statuses</option>
          {Object.entries(GUEST_STATUS_LABELS).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        <select
          name="attendance"
          defaultValue={params.attendance ?? ""}
          className={inputCls}
        >
          <option value="">All responses</option>
          {ATTENDANCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select name="checkin" defaultValue={params.checkin ?? ""} className={inputCls}>
          <option value="">Check-in: all</option>
          <option value="yes">Checked in</option>
          <option value="no">Not checked in</option>
        </select>
        <select name="sort" defaultValue={params.sort ?? ""} className={inputCls}>
          <option value="">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name A–Z</option>
        </select>
        <div className="col-span-2 flex gap-2 md:col-span-5 md:justify-end">
          <Link href="/admin/guests" className={btnSecondary}>
            Reset
          </Link>
          <button className={btnPrimary}>Apply Filters</button>
        </div>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          title="No guests found"
          description="Adjust the filters, add a guest manually, or import a CSV guest list."
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Group</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Attendance</th>
                <th className="px-4 py-3">Check-in</th>
                <th className="px-4 py-3">Registered</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/guests/${g.id}`}
                      className="font-medium text-burgundy hover:underline"
                    >
                      {g.fullName}
                    </Link>
                    <p className="text-xs text-slate-400">{g.attendeeCode}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {g.email && <p>{g.email}</p>}
                    {g.phone && <p>{g.phone}</p>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{g.groupName ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge value={g.status} />
                  </td>
                  <td className="px-4 py-3">
                    {g.attendanceResponse ? (
                      <Badge
                        value={g.attendanceResponse}
                        label={ATTENDANCE_LABELS[g.attendanceResponse]}
                      />
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {g.checkedInAt ? (
                      <Badge value="checked_in" label="Checked in" />
                    ) : (
                      <span className="text-xs text-slate-400">Not yet</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {g.createdAt.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} makeHref={makeHref} />
    </>
  );
}
