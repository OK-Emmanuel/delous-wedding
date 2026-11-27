import Link from "next/link";
import { requirePermission } from "@/lib/auth/permissions";
import { dashboardStats } from "@/services/analytics.service";
import { StatCard, PageHeader, Card, btnPrimary, btnSecondary } from "@/components/admin/ui";
import {
  AttendancePie,
  GroupBars,
  TrendChart,
} from "@/components/admin/DashboardCharts";
import { ATTENDANCE_LABELS } from "@/lib/constants";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserAdd01Icon,
  CheckmarkCircle01Icon,
  Download01Icon,
  FileImportIcon,
} from "@hugeicons/core-free-icons";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const session = await requirePermission("view_dashboard");
  const stats = await dashboardStats();

  const attendanceData = ["definitely", "likely", "unsure", "declined"].map(
    (key) => ({
      name: ATTENDANCE_LABELS[key],
      value:
        stats.attendance.find((a) => a.response === key)?.count ?? 0,
    }),
  );

  const limited = session.role === "checkin_officer" || session.role === "content_manager";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description={`Ẹ káàbọ̀, ${session.name.split(" ")[0]} — here is the live operational summary for DELOUS '26.`}
        action={
          !limited ? (
            <div className="flex flex-wrap items-center gap-2.5">
              <Link href="/admin/guests/import" className={btnSecondary}>
                <HugeiconsIcon icon={FileImportIcon} size={16} />
                <span>Import CSV</span>
              </Link>
              <Link href="/admin/guests/new" className={btnPrimary}>
                <HugeiconsIcon icon={UserAdd01Icon} size={16} />
                <span>Add Guest</span>
              </Link>
            </div>
          ) : undefined
        }
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Registered Guests"
          value={stats.registered}
          hint={`${stats.publicRegistrations} via public portal`}
          accent="burgundy"
        />
        <StatCard
          label="Preloaded Guests"
          value={stats.preloaded}
          hint={
            stats.registrationRate !== null
              ? `${stats.registrationRate}% converted`
              : "No preload data yet"
          }
          accent="gold"
        />
        <StatCard
          label="Admitted / Checked In"
          value={stats.checkedIn}
          hint={`${stats.checkInRate}% check-in rate`}
          accent="emerald"
        />
        <StatCard
          label="Pending Check-in"
          value={stats.outstanding}
          hint={`${stats.revoked} tickets revoked`}
          accent="slate"
        />
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200/80 bg-white p-3 shadow-xs">
        <span className="px-2 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Quick Actions:
        </span>
        <Link
          href="/admin/check-in"
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 transition hover:bg-emerald-100"
        >
          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />
          <span>Launch Scanner</span>
        </Link>
        <Link
          href="/admin/guests"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          <span>View All Guests</span>
        </Link>
        <a
          href="/api/admin/guests/export"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
        >
          <HugeiconsIcon icon={Download01Icon} size={14} />
          <span>Download Master CSV</span>
        </a>
      </div>

      {/* Primary Analytics Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card
          title="Registration Activity"
          description="Daily submissions across the last 14 days."
        >
          {stats.trend.length > 0 ? (
            <TrendChart data={stats.trend} />
          ) : (
            <div className="flex h-[260px] items-center justify-center">
              <p className="text-xs font-medium text-zinc-400">
                No registrations logged yet
              </p>
            </div>
          )}
        </Card>

        <Card
          title="Attendance RSVP Certainty"
          description="Breakdown of confirmed RSVP commitments."
        >
          <AttendancePie data={attendanceData} />
        </Card>
      </div>

      {/* Group Distribution Breakdown */}
      <Card
        title="Guest Allocation by Invitation Group"
        description="Comparing pre-assigned allocations against live admissions."
      >
        {stats.groupDistribution.length > 0 ? (
          <GroupBars data={stats.groupDistribution} />
        ) : (
          <div className="flex h-36 items-center justify-center">
            <p className="text-xs font-medium text-zinc-400">
              No invitation groups or guests assigned yet
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
