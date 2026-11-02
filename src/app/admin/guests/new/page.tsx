import Link from "next/link";
import { asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { invitationGroups } from "@/db/schema";
import { requirePermission } from "@/lib/auth/permissions";
import { ATTENDANCE_OPTIONS } from "@/lib/constants";
import { PageHeader, btnPrimary, inputCls, labelCls } from "@/components/admin/ui";
import { createGuestAction } from "../actions";

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
    <>
      <PageHeader
        title="Add Guest Manually"
        description="Creates a registered guest with an attendee ID and an active QR ticket."
        action={
          <Link href="/admin/guests" className="text-sm text-slate-500 hover:text-burgundy">
            ← Back to guests
          </Link>
        }
      />
      <form
        action={create}
        className="max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelCls}>Full name *</label>
            <input name="fullName" className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input name="email" type="email" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Phone</label>
            <input name="phone" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Invitation group</label>
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
            <label className={labelCls}>Attendance certainty</label>
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
            <label className={labelCls}>Invited by</label>
            <input name="invitedBy" className={inputCls} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Internal notes</label>
            <textarea name="notes" rows={3} className={inputCls} />
          </div>
        </div>
        <button className={`${btnPrimary} mt-5`}>Add Guest</button>
      </form>
    </>
  );
}
