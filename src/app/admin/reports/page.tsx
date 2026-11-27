import { desc } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requirePermission } from "@/lib/auth/permissions";
import { dashboardStats } from "@/services/analytics.service";
import { ATTENDANCE_LABELS } from "@/lib/constants";
import { PageHeader, StatCard, Card, btnSecondary } from "@/components/admin/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Download01Icon,
  Shield01Icon,
  File01Icon,
  PrinterIcon,
} from "@hugeicons/core-free-icons";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  await requirePermission("export_records");
  const stats = await dashboardStats();
  const recentAudit = await db
    .select({
      id: auditLogs.id,
      action: auditLogs.action,
      entityType: auditLogs.entityType,
      entityId: auditLogs.entityId,
      createdAt: auditLogs.createdAt,
      userName: users.name,
    })
    .from(auditLogs)
    .leftJoin(users, eq(users.id, auditLogs.userId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(30);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Audit Intelligence"
        description="Operational conversion metrics, downloadable CSV registers, and an immutable log of administrative actions."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Preload Conversion Rate"
          value={stats.registrationRate !== null ? `${stats.registrationRate}%` : "n/a"}
          hint={`${stats.preloadedRegistered} of ${stats.preloaded} preloaded registered`}
          accent="gold"
        />
        <StatCard
          label="Entrance Check-in Rate"
          value={`${stats.checkInRate}%`}
          hint={`${stats.checkedIn} of ${stats.registered} eligible admitted`}
          accent="emerald"
        />
        <StatCard
          label="Public Registrations"
          value={stats.publicRegistrations}
          hint="Self-registered via public portal"
          accent="burgundy"
        />
        <StatCard
          label="Confirmed Admissions"
          value={stats.confirmed}
          hint={`${stats.revoked} passes revoked`}
          accent="slate"
        />
      </div>

      {/* Downloadable Registers Card */}
      <Card
        title="Downloadable Event Registers (CSV)"
        description="Export filtered guest rosters for venue coordinators, caterers, and emergency physical checklists."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <a
            href="/api/admin/guests/export"
            className="flex items-center gap-3 rounded-xl border border-zinc-200/80 p-4 transition hover:border-burgundy/40 hover:bg-zinc-50/70"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-burgundy/10 text-burgundy">
              <HugeiconsIcon icon={Download01Icon} size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">Master Guest Register</p>
              <p className="text-[11px] text-zinc-500">All registered & preloaded records</p>
            </div>
          </a>

          <a
            href="/api/admin/guests/export?checkin=yes"
            className="flex items-center gap-3 rounded-xl border border-zinc-200/80 p-4 transition hover:border-emerald-500/40 hover:bg-emerald-50/20"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100/70 text-emerald-800">
              <HugeiconsIcon icon={Download01Icon} size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">Admitted Guests</p>
              <p className="text-[11px] text-zinc-500">Guests verified at the entrance</p>
            </div>
          </a>

          <a
            href="/api/admin/guests/export?checkin=no"
            className="flex items-center gap-3 rounded-xl border border-zinc-200/80 p-4 transition hover:border-amber-500/40 hover:bg-amber-50/20"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100/70 text-amber-800">
              <HugeiconsIcon icon={Download01Icon} size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">Outstanding Check-ins</p>
              <p className="text-[11px] text-zinc-500">Guests registered but not yet arrived</p>
            </div>
          </a>

          <a
            href="/api/admin/guests/export?status=preloaded"
            className="flex items-center gap-3 rounded-xl border border-zinc-200/80 p-4 transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
              <HugeiconsIcon icon={Download01Icon} size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">Unregistered Preloaded</p>
              <p className="text-[11px] text-zinc-500">VIPs yet to complete their RSVP pass</p>
            </div>
          </a>

          <a
            href="/api/admin/guests/export?attendance=definitely"
            className="flex items-center gap-3 rounded-xl border border-zinc-200/80 p-4 transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
              <HugeiconsIcon icon={Download01Icon} size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">Confirmed Attendees</p>
              <p className="text-[11px] text-zinc-500">{ATTENDANCE_LABELS.definitely} responses</p>
            </div>
          </a>
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-zinc-50 p-3 text-xs text-zinc-500">
          <HugeiconsIcon icon={PrinterIcon} size={16} className="text-zinc-400 shrink-0" />
          <span>
            Operational guidance: Print the <strong>Master Guest Register</strong> CSV on the morning of the wedding as the official physical fallback for the access team.
          </span>
        </div>
      </Card>

      {/* Audit Trail Card */}
      <Card
        title="Administrative Activity Log"
        description="Immutable chronological record of sensitive operations, staff actions, and setting modifications."
      >
        {recentAudit.length === 0 ? (
          <p className="text-xs text-zinc-400 py-6 text-center">
            No audited actions logged in the system yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-100 bg-zinc-50/60 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Actor / Staff Member</th>
                  <th className="px-4 py-3">Action Description</th>
                  <th className="px-4 py-3">Entity Type</th>
                  <th className="px-4 py-3">Entity ID</th>
                  <th className="px-4 py-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recentAudit.map((a) => (
                  <tr key={a.id} className="hover:bg-zinc-50/50">
                    <td className="px-4 py-3 font-semibold text-zinc-900">
                      {a.userName ?? (
                        <span className="text-zinc-400 font-normal">System Action</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-700">
                      {a.action}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 capitalize">
                      {a.entityType ?? "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-400">
                      {a.entityId ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-500">
                      {a.createdAt.toLocaleString("en-GB", {
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
        )}
      </Card>
    </div>
  );
}
