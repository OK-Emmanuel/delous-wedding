import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { db } from "@/db";
import { checkIns, guests, tickets } from "@/db/schema";
import { requirePermission } from "@/lib/auth/permissions";
import {
  Badge,
  EmptyState,
  PageHeader,
  Pagination,
  StatCard,
} from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePermission("manage_guests");
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [rows, [stats]] = await Promise.all([
    db
      .select({
        id: tickets.id,
        status: tickets.status,
        issuedAt: tickets.issuedAt,
        revokedAt: tickets.revokedAt,
        guestId: guests.id,
        fullName: guests.fullName,
        attendeeCode: guests.attendeeCode,
        checkedInAt: checkIns.checkedInAt,
      })
      .from(tickets)
      .innerJoin(guests, eq(guests.id, tickets.guestId))
      .leftJoin(checkIns, eq(checkIns.ticketId, tickets.id))
      .orderBy(desc(tickets.issuedAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`count(*) filter (where ${tickets.status} = 'active')::int`,
        revoked: sql<number>`count(*) filter (where ${tickets.status} = 'revoked')::int`,
        used: sql<number>`(select count(*) from ${checkIns})::int`,
      })
      .from(tickets),
  ]);

  const totalPages = Math.max(1, Math.ceil(stats.total / PAGE_SIZE));

  return (
    <>
      <PageHeader
        title="Digital Tickets"
        description="QR tokens are stored hashed — tickets can only be re-issued, never read back."
      />
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Issued" value={stats.total} accent="burgundy" />
        <StatCard label="Active" value={stats.active} accent="emerald" />
        <StatCard label="Revoked / Rotated" value={stats.revoked} accent="slate" />
        <StatCard label="Used at Entrance" value={stats.used} accent="gold" />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No tickets issued yet" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Guest</th>
                <th className="px-4 py-3">Ticket status</th>
                <th className="px-4 py-3">Issued</th>
                <th className="px-4 py-3">Admission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/guests/${t.guestId}`}
                      className="font-medium text-burgundy hover:underline"
                    >
                      {t.fullName}
                    </Link>
                    <p className="text-xs text-slate-400">{t.attendeeCode}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge value={t.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {t.issuedAt.toLocaleString("en-GB", {
                      timeZone: "Africa/Lagos",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {t.checkedInAt ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />
                        <span>
                          Checked in{" "}
                          {t.checkedInAt.toLocaleTimeString("en-GB", {
                            timeZone: "Africa/Lagos",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Unused</span>
                    )}
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
        makeHref={(p) => `/admin/tickets?page=${p}`}
      />
    </>
  );
}
