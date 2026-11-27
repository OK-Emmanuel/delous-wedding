import Link from "next/link";
import { asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { invitationGroups } from "@/db/schema";
import { requirePermission } from "@/lib/auth/permissions";
import { ATTENDANCE_OPTIONS } from "@/lib/constants";
import { PageHeader, Card, btnPrimary, inputCls, labelCls } from "@/components/admin/ui";
import { createGuestAction } from "../actions";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, UserAdd01Icon } from "@hugeicons/core-free-icons";

export const dynamic = "force-dynamic";

export default async function NewGuestPage() {
  await requirePermission("manage_guests");
  const groups = await db.query.invitationGroups.findMany({
    orderBy: [asc(invitationGroups.name)],
  });

  async function create(formData: FormData) {
    "use server";
    const result = await createGuestAction(formData);
    if (result.ok) redirect("/admin/guests");
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
        title="Add Guest Manually"
        description="Creates a registered guest record with an attendee ID and an active digital ticket."
      />

      <div className="max-w-2xl">
        <Card
          title="Guest Information"
          description="Fill in the attendee details below. All fields marked with * are required."
        >
          <form action={create} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>Full Name *</label>
                <input
                  name="fullName"
                  placeholder="e.g. Olamide Bakare"
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <label className={labelCls}>Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="guest@example.com"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Phone Number</label>
                <input
                  name="phone"
                  placeholder="+234 801 234 5678"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls}>Invitation Group</label>
                <select name="groupId" defaultValue="" className={inputCls}>
                  <option value="">Unassigned</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelCls}>RSVP Attendance Certainty</label>
                <select name="attendanceResponse" defaultValue="" className={inputCls}>
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
                  placeholder="Bride, Groom, Parents, etc."
                  className={inputCls}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Internal Administrative Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="VIP, dietary requirements, table allocation preferences..."
                  className={inputCls}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
              <Link
                href="/admin/guests"
                className="rounded-lg px-4 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition"
              >
                Cancel
              </Link>
              <button type="submit" className={btnPrimary}>
                <HugeiconsIcon icon={UserAdd01Icon} size={15} />
                <span>Create Guest Record</span>
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
