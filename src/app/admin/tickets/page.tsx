import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Ticket01Icon,
  Shield01Icon,
  QrCodeIcon,
} from "@hugeicons/core-free-icons";
import { db } from "@/db";
import { checkIns, guests, tickets } from "@/db/schema";
import { requirePermission } from "@/lib/auth/permissions";
import {
  Badge,
  EmptyState,
  PageHeader,
  Pagination,
  StatCard,
  Card,
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
    <div className="space-y-6">
      <PageHeader
        title="Digital QR Passes"
        description="Encrypted digital credentials for wedding entrance admission."
      />

      {/* Security Info Card */}
      <div className="flex items-start gap-3 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs text-xs text-zinc-600">
        <HugeiconsIcon icon={Shield01Icon} size={18} className="text-zinc-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-zinc-900">Cryptographically Hashed Access Tokens</p>
          <p className="mt-0.5 text-zinc-500">
            QR credentials use one-way HMAC hashing in the database. Passes cannot be reverse-engineered or read back in plaintext; they can only be verified or re-issued.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Issued" value={stats.total} accent="burgundy" />
        <StatCard label="Active Passes" value={stats.active} accent="emerald" />
        <StatCard label="Revoked / Rotated" value={stats.revoked} accent="slate" />
        <StatCard label="Admitted at Gate" value={stats.used} accent="gold" />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No digital passes issued yet"
          description="Passes are automatically generated when guests register or are manually added."
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-100 bg-zinc-50/75 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-5 py-3.5">Guest & Code</th>
                    <th className="px-4 py-3.5">Pass Status</th>
                    <th className="px-4 py-3.5">Issued At</th>
                    <th className="px-5 py-3.5 text-right">Checkpoint Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {rows.map((t) => (
                    <tr key={t.id} className="group hover:bg-zinc-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/guests/${t.guestId}`}
                          className="font-semibold text-zinc-900 group-hover:text-burgundy transition"
                        >
                          {t.fullName}
                        </Link>
                        <p className="font-mono text-[11px] text-zinc-400 mt-0.5">
                          {t.attendeeCode ?? "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge value={t.status} />
                      </td>
                      <td className="px-4 py-3.5 font-normal text-zinc-500">
                        {t.issuedAt.toLocaleString("en-GB", {
                          timeZone: "Africa/Lagos",
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {t.checkedInAt ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />
                            <span>
                              Admitted at{" "}
                              {t.checkedInAt.toLocaleTimeString("en-GB", {
                                timeZone: "Africa/Lagos",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </span>
                        ) : (
                          <span className="text-zinc-400 font-medium">Unused</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {rows.map((t) => (
              <Link
                key={t.id}
                href={`/admin/guests/${t.guestId}`}
                className="block rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs hover:border-zinc-300 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900">
                      {t.fullName}
                    </h3>
                    <p className="font-mono text-xs text-zinc-400 mt-0.5">
                      {t.attendeeCode ?? "No code"}
                    </p>
                  </div>
                  <Badge value={t.status} />
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2 text-xs text-zinc-500">
                  <span>
                    Issued:{" "}
                    {t.issuedAt.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                  <span>
                    {t.checkedInAt ? (
                      <span className="text-emerald-700 font-semibold">Admitted</span>
                    ) : (
                      "Unused"
                    )}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            makeHref={(p) => `/admin/tickets?page=${p}`}
          />
        </>
      )}
    </div>
  );
}
