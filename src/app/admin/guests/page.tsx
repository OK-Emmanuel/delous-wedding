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
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  Download01Icon,
  FileImportIcon,
  UserAdd01Icon,
  FilterIcon,
  CheckmarkCircle01Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons";

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
    <div className="space-y-6">
      <PageHeader
        title="Guest Directory"
        description={`${count.toLocaleString()} guest record${count === 1 ? "" : "s"} found across invitation tiers.`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`/api/admin/guests/export?${exportQs}`}
              className={btnSecondary}
            >
              <HugeiconsIcon icon={Download01Icon} size={15} />
              <span>Export CSV</span>
            </a>
            <Link href="/admin/guests/import" className={btnSecondary}>
              <HugeiconsIcon icon={FileImportIcon} size={15} />
              <span>Import CSV</span>
            </Link>
            <Link href="/admin/guests/new" className={btnPrimary}>
              <HugeiconsIcon icon={UserAdd01Icon} size={15} />
              <span>Add Guest</span>
            </Link>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <form
        method="GET"
        className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="relative sm:col-span-2">
            <HugeiconsIcon
              icon={Search01Icon}
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Search by name, ID, email, or phone…"
              className={`${inputCls} !pl-10`}
            />
          </div>

          <div>
            <select name="group" defaultValue={params.group ?? ""} className={inputCls}>
              <option value="">All invitation groups</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select name="status" defaultValue={params.status ?? ""} className={inputCls}>
              <option value="">All statuses</option>
              {Object.entries(GUEST_STATUS_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              name="attendance"
              defaultValue={params.attendance ?? ""}
              className={inputCls}
            >
              <option value="">RSVP certainty</option>
              {ATTENDANCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select name="checkin" defaultValue={params.checkin ?? ""} className={inputCls}>
              <option value="">Check-in: all</option>
              <option value="yes">Checked in</option>
              <option value="no">Not checked in</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Sort by:</span>
            <select
              name="sort"
              defaultValue={params.sort ?? ""}
              className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs text-zinc-700 focus:outline-none focus:ring-1 focus:ring-burgundy"
            >
              <option value="">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/guests"
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition"
            >
              Clear filters
            </Link>
            <button type="submit" className={btnPrimary}>
              <HugeiconsIcon icon={FilterIcon} size={14} />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </form>

      {/* Guest Data Display */}
      {rows.length === 0 ? (
        <EmptyState
          title="No guest records match your search"
          description="Try broadening your search query, clearing filters, or adding a new guest."
          action={
            <Link href="/admin/guests/new" className={btnPrimary}>
              Add First Guest
            </Link>
          }
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-100 bg-zinc-50/75 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-5 py-3.5">Guest Name & ID</th>
                    <th className="px-4 py-3.5">Contact Details</th>
                    <th className="px-4 py-3.5">Group</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Attendance</th>
                    <th className="px-4 py-3.5">Check-in</th>
                    <th className="px-5 py-3.5 text-right">Added</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {rows.map((g) => (
                    <tr
                      key={g.id}
                      className="group transition-colors hover:bg-zinc-50/70"
                    >
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/guests/${g.id}`}
                          className="font-semibold text-zinc-900 group-hover:text-burgundy transition"
                        >
                          {g.fullName}
                        </Link>
                        <p className="font-mono text-[11px] text-zinc-400 mt-0.5">
                          {g.attendeeCode ?? "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-600">
                        {g.email ? (
                          <p className="truncate max-w-[180px]">{g.email}</p>
                        ) : (
                          <span className="text-zinc-400">No email</span>
                        )}
                        {g.phone && (
                          <p className="text-[11px] text-zinc-400 mt-0.5">{g.phone}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-zinc-700 font-medium">
                        {g.groupName ?? (
                          <span className="text-zinc-400 font-normal">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge value={g.status} />
                      </td>
                      <td className="px-4 py-3.5">
                        {g.attendanceResponse ? (
                          <Badge
                            value={g.attendanceResponse}
                            label={ATTENDANCE_LABELS[g.attendanceResponse]}
                          />
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {g.checkedInAt ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-xs">
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />
                            <span>Checked in</span>
                          </span>
                        ) : (
                          <span className="text-zinc-400">Pending</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right font-normal text-zinc-500">
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
          </div>

          {/* Mobile Card List View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {rows.map((g) => (
              <Link
                key={g.id}
                href={`/admin/guests/${g.id}`}
                className="block rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs hover:border-zinc-300 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900">
                      {g.fullName}
                    </h3>
                    <p className="font-mono text-xs text-zinc-400 mt-0.5">
                      {g.attendeeCode ?? "No ID"}
                    </p>
                  </div>
                  <Badge value={g.status} />
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-600">
                  {g.groupName && (
                    <span className="rounded bg-zinc-100 px-2 py-0.5 text-zinc-700 font-medium">
                      {g.groupName}
                    </span>
                  )}
                  {g.attendanceResponse && (
                    <Badge
                      value={g.attendanceResponse}
                      label={ATTENDANCE_LABELS[g.attendanceResponse]}
                    />
                  )}
                  {g.checkedInAt && (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} size={13} />
                      <span>Admitted</span>
                    </span>
                  )}
                </div>

                {(g.email || g.phone) && (
                  <div className="mt-2.5 border-t border-zinc-100 pt-2 text-xs text-zinc-500">
                    {g.email && <p className="truncate">{g.email}</p>}
                    {g.phone && <p>{g.phone}</p>}
                  </div>
                )}
              </Link>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} makeHref={makeHref} />
        </>
      )}
    </div>
  );
}
