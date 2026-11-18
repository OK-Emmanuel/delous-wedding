import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { db } from "@/db";
import { auditLogs, emailOutbox, guests, invitationGroups } from "@/db/schema";
import { requirePermission } from "@/lib/auth/permissions";
import {
  ATTENDANCE_LABELS,
  ATTENDANCE_OPTIONS,
  RELATIONSHIP_LABELS,
} from "@/lib/constants";
import { Badge, PageHeader, btnPrimary, inputCls, labelCls } from "@/components/admin/ui";
import GuestActions from "@/components/admin/GuestActions";
import { updateGuestAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function GuestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePermission("manage_guests");
  const { id } = await params;
  const guestId = Number(id);
  if (!Number.isInteger(guestId)) notFound();

  const guest = await db.query.guests.findFirst({
    where: eq(guests.id, guestId),
    with: {
      group: true,
      registration: true,
      tickets: true,
      checkIn: { with: { officer: true } },
    },
  });
  if (!guest) notFound();

  const [groups, emails, activity] = await Promise.all([
    db.query.invitationGroups.findMany({ orderBy: [asc(invitationGroups.name)] }),
    db.query.emailOutbox.findMany({
      where: eq(emailOutbox.guestId, guestId),
      orderBy: [desc(emailOutbox.createdAt)],
      limit: 10,
    }),
    db.query.auditLogs.findMany({
      where: eq(auditLogs.entityId, String(guestId)),
      orderBy: [desc(auditLogs.createdAt)],
      limit: 15,
    }),
  ]);

  const activeTicket = guest.tickets.find((t) => t.status === "active");
  async function updateWithId(formData: FormData) {
    "use server";
    await updateGuestAction(guestId, formData);
  }

  return (
    <>
      <PageHeader
        title={guest.fullName}
        description={`${guest.attendeeCode ?? "No attendee ID"} · joined ${guest.createdAt.toLocaleDateString("en-GB")}`}
        action={
          <Link href="/admin/guests" className="text-sm text-slate-500 hover:text-burgundy">
            ← Back to guests
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">Overview</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
              <div>
                <dt className="text-xs text-slate-400">Status</dt>
                <dd className="mt-1">
                  <Badge value={guest.status} />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Source</dt>
                <dd className="mt-1 capitalize text-slate-700">{guest.source}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Check-in</dt>
                <dd className="mt-1">
                  {guest.checkIn ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} size={15} />
                      <span>
                        {guest.checkIn.checkedInAt.toLocaleString("en-GB", {
                          timeZone: "Africa/Lagos",
                        })}
                        {guest.checkIn.officer && ` by ${guest.checkIn.officer.name}`}
                      </span>
                    </span>
                  ) : (
                    <span className="text-slate-500">Not checked in</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Relationship</dt>
                <dd className="mt-1 text-slate-700">
                  {guest.registration?.relationship
                    ? RELATIONSHIP_LABELS[guest.registration.relationship]
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Attendance</dt>
                <dd className="mt-1 text-slate-700">
                  {guest.registration?.attendanceResponse
                    ? ATTENDANCE_LABELS[guest.registration.attendanceResponse]
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Ticket</dt>
                <dd className="mt-1">
                  {activeTicket ? (
                    <Badge value="active" label="Active ticket" />
                  ) : (
                    <Badge value="revoked" label="No active ticket" />
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Edit form */}
          <form
            action={updateWithId}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <h2 className="mb-4 text-sm font-semibold text-slate-700">Edit details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelCls}>Full name</label>
                <input name="fullName" defaultValue={guest.fullName} className={inputCls} required />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input name="email" type="email" defaultValue={guest.email ?? ""} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Phone</label>
                <input name="phone" defaultValue={guest.phone ?? ""} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Invitation group</label>
                <select name="groupId" defaultValue={guest.groupId ?? ""} className={inputCls}>
                  <option value="">Unassigned</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Attendance certainty</label>
                <select
                  name="attendanceResponse"
                  defaultValue={guest.registration?.attendanceResponse ?? ""}
                  className={inputCls}
                >
                  <option value="">Not set</option>
                  {ATTENDANCE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Invited by</label>
                <input name="invitedBy" defaultValue={guest.invitedBy ?? ""} className={inputCls} />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Internal notes</label>
                <textarea name="notes" defaultValue={guest.notes ?? ""} rows={3} className={inputCls} />
              </div>
            </div>
            <button className={`${btnPrimary} mt-4`}>Save Changes</button>
          </form>
        </div>

        <div className="space-y-6">
          <GuestActions
            guestId={guestId}
            status={guest.status}
            hasEmail={!!guest.email}
            checkedIn={!!guest.checkIn}
          />

          {/* Email history */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Emails</h2>
            {emails.length === 0 ? (
              <p className="text-sm text-slate-400">No emails yet</p>
            ) : (
              <ul className="space-y-2 text-xs">
                {emails.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-2">
                    <span className="truncate text-slate-600">{e.template.replace(/_/g, " ")}</span>
                    <Badge value={e.status} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Activity */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Activity</h2>
            {activity.length === 0 ? (
              <p className="text-sm text-slate-400">No recorded activity</p>
            ) : (
              <ul className="space-y-2 text-xs text-slate-600">
                {activity.map((a) => (
                  <li key={a.id}>
                    <span className="font-medium">{a.action}</span>
                    <span className="text-slate-400">
                      {" "}
                      · {a.createdAt.toLocaleString("en-GB", { timeZone: "Africa/Lagos" })}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
