import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  ArrowLeft01Icon,
  Mail01Icon,
  Clock01Icon,
  Ticket01Icon,
  UserEdit01Icon,
} from "@hugeicons/core-free-icons";
import { db } from "@/db";
import { auditLogs, emailOutbox, guests, invitationGroups } from "@/db/schema";
import { requirePermission } from "@/lib/auth/permissions";
import {
  ATTENDANCE_LABELS,
  ATTENDANCE_OPTIONS,
  RELATIONSHIP_LABELS,
} from "@/lib/constants";
import { Badge, PageHeader, Card, btnPrimary, inputCls, labelCls } from "@/components/admin/ui";
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
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
        <Link
          href="/admin/guests"
          className="inline-flex items-center gap-1 font-medium text-zinc-600 hover:text-burgundy transition"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
          <span>Back to guest directory</span>
        </Link>
      </div>

      <PageHeader
        title={guest.fullName}
        description={`Attendee ID: ${guest.attendeeCode ?? "Pending assignment"} · Created on ${guest.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`}
        action={<Badge value={guest.status} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Overview & Edit Form */}
        <div className="space-y-6 lg:col-span-2">
          {/* Guest Metadata Summary Card */}
          <Card
            title="Guest Overview"
            description="Operational attributes, registration response, and entry status."
          >
            <dl className="grid grid-cols-2 gap-4 text-xs sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Status
                </dt>
                <dd className="mt-1.5">
                  <Badge value={guest.status} />
                </dd>
              </div>

              <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Source
                </dt>
                <dd className="mt-1.5 text-xs font-semibold capitalize text-zinc-800">
                  {guest.source}
                </dd>
              </div>

              <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Check-in Status
                </dt>
                <dd className="mt-1.5">
                  {guest.checkIn ? (
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />
                      <span>Admitted</span>
                    </span>
                  ) : (
                    <span className="text-zinc-500 font-medium">Pending admission</span>
                  )}
                </dd>
              </div>

              <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Relationship
                </dt>
                <dd className="mt-1.5 text-xs font-medium text-zinc-800">
                  {guest.registration?.relationship
                    ? RELATIONSHIP_LABELS[guest.registration.relationship]
                    : "—"}
                </dd>
              </div>

              <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  RSVP Response
                </dt>
                <dd className="mt-1.5">
                  {guest.registration?.attendanceResponse ? (
                    <Badge
                      value={guest.registration.attendanceResponse}
                      label={ATTENDANCE_LABELS[guest.registration.attendanceResponse]}
                    />
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </dd>
              </div>

              <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
                <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                  Digital Pass
                </dt>
                <dd className="mt-1.5">
                  {activeTicket ? (
                    <Badge value="active" label="Active Pass" />
                  ) : (
                    <Badge value="revoked" label="No Active Pass" />
                  )}
                </dd>
              </div>
            </dl>

            {guest.checkIn && (
              <div className="mt-4 rounded-xl border border-emerald-200/60 bg-emerald-50/70 p-3 text-xs text-emerald-900">
                <p className="font-semibold">Check-in Verification:</p>
                <p className="mt-0.5 text-emerald-800">
                  Admitted at{" "}
                  {guest.checkIn.checkedInAt.toLocaleString("en-GB", {
                    timeZone: "Africa/Lagos",
                  })}
                  {guest.checkIn.officer && ` by officer ${guest.checkIn.officer.name}`} via{" "}
                  <span className="font-semibold uppercase">{guest.checkIn.method}</span>
                </p>
              </div>
            )}
          </Card>

          {/* Edit Guest Details Form */}
          <Card
            title="Update Guest Details"
            description="Modify contact information, invitation tier, and internal notes."
          >
            <form action={updateWithId} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Full Name *</label>
                  <input
                    name="fullName"
                    defaultValue={guest.fullName}
                    className={inputCls}
                    required
                  />
                </div>
                <div>
                  <label className={labelCls}>Email Address</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={guest.email ?? ""}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Phone Number</label>
                  <input
                    name="phone"
                    defaultValue={guest.phone ?? ""}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Invitation Group</label>
                  <select
                    name="groupId"
                    defaultValue={guest.groupId ?? ""}
                    className={inputCls}
                  >
                    <option value="">Unassigned</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Attendance RSVP</label>
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
                  <label className={labelCls}>Invited By</label>
                  <input
                    name="invitedBy"
                    defaultValue={guest.invitedBy ?? ""}
                    className={inputCls}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Internal Administrative Notes</label>
                  <textarea
                    name="notes"
                    defaultValue={guest.notes ?? ""}
                    rows={3}
                    className={inputCls}
                    placeholder="Dietary requests, special seating, VIP status..."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button type="submit" className={btnPrimary}>
                  <HugeiconsIcon icon={UserEdit01Icon} size={15} />
                  <span>Save Guest Changes</span>
                </button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Actions, Outbox & Audit Logs */}
        <div className="space-y-6">
          <GuestActions
            guestId={guestId}
            status={guest.status}
            hasEmail={!!guest.email}
            checkedIn={!!guest.checkIn}
          />

          {/* Email Outbox Card */}
          <Card
            title="Email History"
            description="Campaign and transactional emails sent to this guest."
          >
            {emails.length === 0 ? (
              <p className="text-xs text-zinc-400 py-3 text-center">
                No outbound emails dispatched yet
              </p>
            ) : (
              <ul className="divide-y divide-zinc-100 text-xs">
                {emails.map((e) => (
                  <li key={e.id} className="flex items-center justify-between gap-2 py-2.5">
                    <div className="flex items-center gap-2 truncate">
                      <HugeiconsIcon icon={Mail01Icon} size={14} className="text-zinc-400 shrink-0" />
                      <span className="font-medium text-zinc-700 capitalize truncate">
                        {e.template.replace(/_/g, " ")}
                      </span>
                    </div>
                    <Badge value={e.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Activity Timeline Card */}
          <Card
            title="Activity Audit Log"
            description="Recent audit trail events for this guest profile."
          >
            {activity.length === 0 ? (
              <p className="text-xs text-zinc-400 py-3 text-center">
                No recorded administrative activity
              </p>
            ) : (
              <ul className="space-y-3 text-xs">
                {activity.map((a) => (
                  <li key={a.id} className="flex items-start gap-2.5 border-l-2 border-zinc-200 pl-3">
                    <div>
                      <p className="font-medium text-zinc-800">{a.action}</p>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {a.createdAt.toLocaleString("en-GB", {
                          timeZone: "Africa/Lagos",
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
