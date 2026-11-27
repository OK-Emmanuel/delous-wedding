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
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Shield01Icon,
  UserAdd01Icon,
  LockPasswordIcon,
  UserEdit01Icon,
} from "@hugeicons/core-free-icons";

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
    <div className="space-y-6">
      <PageHeader
        title="Staff & Permissions"
        description="Role-based access control. Permissions are enforced cryptographically server-side across all mutations and queries."
      />

      {/* Add Staff Account Collapsible Card */}
      <details className="group rounded-2xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden">
        <summary className="flex cursor-pointer items-center justify-between px-6 py-4.5 text-xs sm:text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50/70 select-none">
          <span className="inline-flex items-center gap-2 text-burgundy">
            <HugeiconsIcon icon={UserAdd01Icon} size={16} />
            <span>Create Staff Member Account</span>
          </span>
          <span className="text-xs text-zinc-400 group-open:rotate-180 transition-transform">
            ▼
          </span>
        </summary>
        <form
          action={create}
          className="border-t border-zinc-100 bg-zinc-50/40 p-6 space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Staff Full Name *</label>
              <input
                name="name"
                placeholder="e.g. Samuel Adeyemi"
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Email Address *</label>
              <input
                name="email"
                type="email"
                placeholder="staff@delous26.com"
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Initial Password * (min 8 characters)</label>
              <input
                name="password"
                type="text"
                placeholder="Minimum 8 characters"
                className={inputCls}
                required
                minLength={8}
              />
            </div>
            <div>
              <label className={labelCls}>Assigned Role *</label>
              <select name="role" defaultValue="checkin_officer" className={inputCls}>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className={btnPrimary}>
              Create Staff Account
            </button>
          </div>
        </form>
      </details>

      {/* Staff Members List */}
      <div className="space-y-4">
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

          const initials = u.name
            .split(" ")
            .map((p) => p[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();

          return (
            <details
              key={u.id}
              className="group rounded-2xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden"
            >
              <summary className="flex cursor-pointer flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 select-none hover:bg-zinc-50/50 transition">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-burgundy/10 text-xs font-bold text-burgundy border border-burgundy/20">
                    {initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-zinc-900 tracking-tight">
                        {u.name}
                      </span>
                      {isSelf && (
                        <span className="rounded bg-burgundy/10 px-2 py-0.5 text-[10px] font-bold text-burgundy">
                          You
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">{u.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge
                    value={u.role}
                    label={ROLE_LABELS[u.role] ?? u.role}
                  />
                  <Badge
                    value={u.status === "disabled" ? "revoked" : "active"}
                    label={u.status === "disabled" ? "Disabled" : "Active"}
                  />
                  {!isSelf && (
                    <span className="text-xs text-zinc-400 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  )}
                </div>
              </summary>

              {!isSelf && (
                <div className="grid grid-cols-1 gap-6 border-t border-zinc-100 bg-zinc-50/40 p-6 md:grid-cols-2">
                  {/* Role and Status Form */}
                  <form action={updateRole} className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                      <HugeiconsIcon icon={UserEdit01Icon} size={14} />
                      <span>Role & Status Permission</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Role</label>
                        <select name="role" defaultValue={u.role} className={inputCls}>
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {ROLE_LABELS[r]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Account State</label>
                        <select name="status" defaultValue={u.status} className={inputCls}>
                          <option value="active">Active</option>
                          <option value="disabled">Disabled</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end pt-1">
                      <button type="submit" className={btnPrimary}>
                        Update Role
                      </button>
                    </div>
                  </form>

                  {/* Password Reset Form */}
                  <form action={resetPassword} className="space-y-3 md:border-l md:border-zinc-200/80 md:pl-6">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                      <HugeiconsIcon icon={LockPasswordIcon} size={14} />
                      <span>Reset Account Password</span>
                    </h4>
                    <div>
                      <label className={labelCls}>New Password (min 8 chars)</label>
                      <input
                        name="password"
                        type="text"
                        minLength={8}
                        className={inputCls}
                        placeholder="Type new secure password"
                        required
                      />
                    </div>
                    <div className="flex justify-end pt-1">
                      <button type="submit" className={btnSecondary}>
                        Reset Password
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </details>
          );
        })}
      </div>
    </div>
  );
}
