import { asc } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requirePermission } from "@/lib/auth/permissions";
import { ROLE_LABELS } from "@/lib/constants";
import {
  Badge,
  PageHeader,
  btnPrimary,
  btnSecondary,
  inputCls,
  labelCls,
} from "@/components/admin/ui";
import {
  createStaffAction,
  resetStaffPasswordAction,
  updateStaffRoleAction,
} from "./actions";

export const dynamic = "force-dynamic";

const ROLES = [
  "super_admin",
  "admin",
  "checkin_officer",
  "content_manager",
] as const;

export default async function StaffPage() {
  const session = await requirePermission("manage_staff");
  const staff = await db.query.users.findMany({ orderBy: [asc(users.name)] });

  async function create(formData: FormData) {
    "use server";
    await createStaffAction(formData);
  }

  return (
    <>
      <PageHeader
        title="Staff & Permissions"
        description="Role permissions are enforced server-side on every action, not just hidden in the interface."
      />

      <details className="mb-5 rounded-xl border border-slate-200 bg-white shadow-sm">
        <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-burgundy">
          + Add staff member
        </summary>
        <form action={create} className="grid gap-4 border-t border-slate-100 p-5 md:grid-cols-2">
          <div>
            <label className={labelCls}>Name *</label>
            <input name="name" className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>Email *</label>
            <input name="email" type="email" className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>Password * (min 8 characters)</label>
            <input name="password" type="text" className={inputCls} required minLength={8} />
          </div>
          <div>
            <label className={labelCls}>Role *</label>
            <select name="role" defaultValue="checkin_officer" className={inputCls}>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <button className={btnPrimary}>Create Account</button>
          </div>
        </form>
      </details>

      <div className="space-y-3">
        {staff.map((u) => {
          const updateRole = async (formData: FormData) => {
            "use server";
            await updateStaffRoleAction(u.id, formData);
          };
          const resetPassword = async (formData: FormData) => {
            "use server";
            await resetStaffPasswordAction(u.id, formData);
          };
          const isSelf = u.id === session.id;
          return (
            <details key={u.id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <span className="font-medium text-slate-800">
                    {u.name}
                    {isSelf && <span className="ml-2 text-xs text-slate-400">(you)</span>}
                  </span>
                  <p className="text-xs text-slate-500">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    value={u.status === "disabled" ? "revoked" : "active"}
                    label={u.status === "disabled" ? "Disabled" : "Active"}
                  />
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                    {ROLE_LABELS[u.role]}
                  </span>
                </div>
              </summary>
              {!isSelf && (
                <div className="grid gap-5 border-t border-slate-100 p-5 md:grid-cols-2">
                  <form action={updateRole} className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className={labelCls}>Role</label>
                      <select name="role" defaultValue={u.role} className={inputCls}>
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className={labelCls}>Status</label>
                      <select name="status" defaultValue={u.status} className={inputCls}>
                        <option value="active">Active</option>
                        <option value="disabled">Disabled</option>
                      </select>
                    </div>
                    <button className={btnPrimary}>Save</button>
                  </form>
                  <form action={resetPassword} className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className={labelCls}>New password</label>
                      <input name="password" type="text" minLength={8} className={inputCls} required />
                    </div>
                    <button className={btnSecondary}>Reset Password</button>
                  </form>
                </div>
              )}
            </details>
          );
        })}
      </div>
    </>
  );
}
