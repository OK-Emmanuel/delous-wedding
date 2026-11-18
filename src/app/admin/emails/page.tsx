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
    <>
      <PageHeader
        title="Email Campaigns"
        description="Durable outbox — registrations never fail because of email delivery."
        action={
          <form action={retryAll}>
            <button className={btnPrimary} disabled={stats.pending + stats.failed === 0}>
              Retry Pending & Failed ({stats.pending + stats.failed})
            </button>
          </form>
        }
      />

      {!sendgridConfigured && (
        <p className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>SendGrid is not configured.</strong> Emails are queued but not
          delivered. Set <code>SENDGRID_API_KEY</code> and <code>SENDGRID_FROM</code>{" "}
          in the environment, then use “Retry Pending &amp; Failed”.
        </p>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Queued" value={stats.total} accent="burgundy" />
        <StatCard label="Pending" value={stats.pending} accent="gold" />
        <StatCard label="Sent" value={stats.sent} accent="emerald" />
        <StatCard label="Failed / Bounced" value={stats.failed} accent="slate" />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No emails queued yet" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Recipient</th>
                <th className="px-4 py-3">Template</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Attempts</th>
                <th className="px-4 py-3">Queued</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{e.guestName ?? "—"}</p>
                    <p className="text-xs text-slate-500">{e.toEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-xs capitalize text-slate-600">
                    {e.template.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge value={e.status} />
                    {e.lastError && (
                      <p className="mt-1 max-w-xs truncate text-xs text-red-600" title={e.lastError}>
                        {e.lastError}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{e.attempts}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {e.createdAt.toLocaleString("en-GB", {
                      timeZone: "Africa/Lagos",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} makeHref={(p) => `/admin/emails?page=${p}`} />
    </>
  );
}
