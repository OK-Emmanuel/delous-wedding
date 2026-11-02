import Link from "next/link";
import { requirePermission } from "@/lib/auth/permissions";
import { dashboardStats } from "@/services/analytics.service";
import { StatCard, PageHeader, btnPrimary } from "@/components/admin/ui";
import {
  AttendancePie,
  GroupBars,
  TrendChart,
} from "@/components/admin/DashboardCharts";
import { ATTENDANCE_LABELS } from "@/lib/constants";

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
    <>
      <PageHeader
        title="Overview"
        description={`Ẹ káàbọ̀, ${session.name.split(" ")[0]} — here is how DELOUS '26 is shaping up.`}
        action={
          !limited ? (
            <Link href="/admin/guests/import" className={btnPrimary}>
              Import Guest CSV
            </Link>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Registered Guests"
          value={stats.registered}
          hint={`${stats.publicRegistrations} via public registration`}
          accent="burgundy"
        />
        <StatCard
          label="Preloaded Guests"
          value={stats.preloaded}
          hint={
            stats.registrationRate !== null
              ? `${stats.registrationRate}% have registered`
              : "None imported yet"
          }
          accent="gold"
        />
        <StatCard
          label="Checked In"
          value={stats.checkedIn}
          hint={`${stats.checkInRate}% of registered guests`}
          accent="emerald"
        />
        <StatCard
          label="Outstanding Check-ins"
          value={stats.outstanding}
          hint={`${stats.revoked} revoked`}
          accent="slate"
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Registration trend (last 14 days)
          </h2>
          {stats.trend.length > 0 ? (
            <TrendChart data={stats.trend} />
          ) : (
            <p className="py-16 text-center text-sm text-slate-400">
              No registrations yet
            </p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Attendance certainty
          </h2>
          <AttendancePie data={attendanceData} />
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          Guest distribution by invitation group
        </h2>
        {stats.groupDistribution.length > 0 ? (
          <GroupBars data={stats.groupDistribution} />
        ) : (
          <p className="py-16 text-center text-sm text-slate-400">No guests yet</p>
        )}
      </div>
    </>
  );
}
