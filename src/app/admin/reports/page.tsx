import { desc } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requirePermission } from "@/lib/auth/permissions";
import { dashboardStats } from "@/services/analytics.service";
import { ATTENDANCE_LABELS } from "@/lib/constants";
import { PageHeader, StatCard, btnSecondary } from "@/components/admin/ui";

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
    <>
      <PageHeader
        title="Reports"
        description="Key rates, downloadable records and the audit trail of sensitive actions."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Registration Rate"
          value={stats.registrationRate !== null ? `${stats.registrationRate}%` : "n/a"}
          hint={`${stats.preloadedRegistered} of ${stats.preloaded} preloaded guests registered`}
          accent="gold"
        />
        <StatCard
          label="Check-in Rate"
          value={`${stats.checkInRate}%`}
          hint={`${stats.checkedIn} of ${stats.registered} eligible guests`}
          accent="emerald"
        />
        <StatCard
          label="Public Registrations"
          value={stats.publicRegistrations}
          hint="reported separately from preloaded conversion"
          accent="burgundy"
        />
        <StatCard
          label="Confirmed"
          value={stats.confirmed}
          hint={`${stats.revoked} revoked`}
          accent="slate"
        />
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Downloadable reports</h2>
        <div className="flex flex-wrap gap-2">
          <a href="/api/admin/guests/export" className={btnSecondary}>
            All guests (CSV)
          </a>
          <a href="/api/admin/guests/export?checkin=yes" className={btnSecondary}>
            Checked-in guests (CSV)
          </a>
          <a href="/api/admin/guests/export?checkin=no" className={btnSecondary}>
            Outstanding check-ins (CSV)
          </a>
          <a href="/api/admin/guests/export?status=preloaded" className={btnSecondary}>
            Unregistered preloaded guests (CSV)
          </a>
          <a href="/api/admin/guests/export?attendance=definitely" className={btnSecondary}>
            {ATTENDANCE_LABELS.definitely} (CSV)
          </a>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          Tip: print the “All guests” export as the access-controlled emergency
          list for the wedding day.
        </p>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          Recent administrative activity
        </h2>
        {recentAudit.length === 0 ? (
          <p className="text-sm text-slate-400">No audited actions yet</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {recentAudit.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2.5">
                <span>
                  <span className="font-medium text-slate-800">{a.userName ?? "System"}</span>{" "}
                  <span className="text-slate-600">{a.action}</span>
                  {a.entityId && (
                    <span className="text-slate-400">
                      {" "}
                      ({a.entityType} #{a.entityId})
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-slate-400">
                  {a.createdAt.toLocaleString("en-GB", {
                    timeZone: "Africa/Lagos",
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
