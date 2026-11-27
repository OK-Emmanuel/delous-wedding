import { desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { emailOutbox, guests } from "@/db/schema";
import { requirePermission, authorize } from "@/lib/auth/permissions";
import { retryOutbox } from "@/lib/email/outbox";
import {
  Badge,
  EmptyState,
  PageHeader,
  Pagination,
  StatCard,
  btnPrimary,
} from "@/components/admin/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  RefreshIcon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

export default async function EmailsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  await requirePermission("manage_emails");
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [rows, [stats]] = await Promise.all([
    db
      .select({
        id: emailOutbox.id,
        toEmail: emailOutbox.toEmail,
        template: emailOutbox.template,
        subject: emailOutbox.subject,
        status: emailOutbox.status,
        attempts: emailOutbox.attempts,
        lastError: emailOutbox.lastError,
        createdAt: emailOutbox.createdAt,
        guestName: guests.fullName,
      })
      .from(emailOutbox)
      .leftJoin(guests, eq(guests.id, emailOutbox.guestId))
      .orderBy(desc(emailOutbox.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db
      .select({
        total: sql<number>`count(*)::int`,
        pending: sql<number>`count(*) filter (where ${emailOutbox.status} = 'pending')::int`,
        sent: sql<number>`count(*) filter (where ${emailOutbox.status} in ('sent','delivered'))::int`,
        failed: sql<number>`count(*) filter (where ${emailOutbox.status} in ('failed','bounced'))::int`,
      })
      .from(emailOutbox),
  ]);

  const totalPages = Math.max(1, Math.ceil(stats.total / PAGE_SIZE));
  const sendgridConfigured = !!process.env.SENDGRID_API_KEY;

  async function retryAll() {
    "use server";
    await authorize("manage_emails");
    await retryOutbox(100);
    revalidatePath("/admin/emails");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Campaigns & Outbox"
        description="Durable asynchronous queue — guest registrations and invitations are never blocked by email dispatch latency."
        action={
          <form action={retryAll}>
            <button
              type="submit"
              className={btnPrimary}
              disabled={stats.pending + stats.failed === 0}
            >
              <HugeiconsIcon icon={RefreshIcon} size={15} />
              <span>Retry Queue ({stats.pending + stats.failed})</span>
            </button>
          </form>
        }
      />

      {!sendgridConfigured && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 text-xs text-amber-900 shadow-xs">
          <HugeiconsIcon icon={Alert02Icon} size={18} className="text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">SendGrid API Key Not Configured</p>
            <p className="mt-0.5 text-amber-800">
              Outbound emails are recorded in the durable queue and will dispatch as soon as <code>SENDGRID_API_KEY</code> is provided in the environment.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Queued" value={stats.total} accent="burgundy" />
        <StatCard label="Pending Delivery" value={stats.pending} accent="gold" />
        <StatCard label="Delivered / Sent" value={stats.sent} accent="emerald" />
        <StatCard label="Failed / Bounced" value={stats.failed} accent="slate" />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No outbound emails queued yet"
          description="Emails dispatched from invitations or registration confirmations will be logged here."
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-zinc-100 bg-zinc-50/75 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-5 py-3.5">Guest & Email</th>
                    <th className="px-4 py-3.5">Template</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Attempts</th>
                    <th className="px-5 py-3.5 text-right">Queued</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {rows.map((e) => (
                    <tr key={e.id} className="hover:bg-zinc-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-zinc-900">
                          {e.guestName ?? "—"}
                        </p>
                        <p className="font-mono text-[11px] text-zinc-400 mt-0.5 truncate max-w-[220px]">
                          {e.toEmail}
                        </p>
                      </td>
                      <td className="px-4 py-3.5 text-zinc-700 capitalize font-medium">
                        {e.template.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge value={e.status} />
                        {e.lastError && (
                          <p
                            className="mt-1 max-w-xs truncate text-[11px] text-rose-600"
                            title={e.lastError}
                          >
                            {e.lastError}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-zinc-600">
                        {e.attempts}
                      </td>
                      <td className="px-5 py-3.5 text-right font-normal text-zinc-500">
                        {e.createdAt.toLocaleString("en-GB", {
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
            {rows.map((e) => (
              <div
                key={e.id}
                className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-sm text-zinc-900">
                      {e.guestName ?? e.toEmail}
                    </h3>
                    <p className="text-xs text-zinc-500 capitalize mt-0.5">
                      {e.template.replace(/_/g, " ")}
                    </p>
                  </div>
                  <Badge value={e.status} />
                </div>

                {e.lastError && (
                  <p className="mt-2 text-xs text-rose-600 break-words">
                    {e.lastError}
                  </p>
                )}

                <div className="mt-2.5 flex items-center justify-between border-t border-zinc-100 pt-2 text-[11px] text-zinc-400">
                  <span>Attempts: {e.attempts}</span>
                  <span>
                    {e.createdAt.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            makeHref={(p) => `/admin/emails?page=${p}`}
          />
        </>
      )}
    </div>
  );
}
