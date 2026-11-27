import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { checkIns, guests, invitationGroups } from "@/db/schema";
import { requirePermission } from "@/lib/auth/permissions";
import {
  Badge,
  EmptyState,
  PageHeader,
  Card,
  StatCard,
  btnDanger,
  btnPrimary,
  btnSecondary,
  inputCls,
  labelCls,
} from "@/components/admin/ui";
import {
  createGroupAction,
  deleteGroupAction,
  updateGroupAction,
} from "./actions";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FolderLibraryIcon,
  UserGroupIcon,
  CheckmarkCircle01Icon,
  ArrowRight01Icon,
  Add01Icon,
} from "@hugeicons/core-free-icons";

export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  await requirePermission("manage_groups");

  const groups = await db
    .select({
      id: invitationGroups.id,
      name: invitationGroups.name,
      description: invitationGroups.description,
      representative: invitationGroups.representative,
      contactPhone: invitationGroups.contactPhone,
      status: invitationGroups.status,
      guestCount: sql<number>`count(${guests.id})::int`,
      registeredCount: sql<number>`count(${guests.id}) filter (where ${guests.status} in ('registered','confirmed'))::int`,
      checkedInCount: sql<number>`count(${checkIns.id})::int`,
    })
    .from(invitationGroups)
    .leftJoin(guests, eq(guests.groupId, invitationGroups.id))
    .leftJoin(checkIns, eq(checkIns.guestId, guests.id))
    .groupBy(invitationGroups.id)
    .orderBy(asc(invitationGroups.name));

  const totalGuests = groups.reduce((acc, g) => acc + g.guestCount, 0);
  const totalCheckedIn = groups.reduce((acc, g) => acc + g.checkedInCount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invitation Groups"
        description="Organisational tool for table allocations and guest groupings — groups do not share credentials."
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Groups"
          value={groups.length}
          hint="Active and archived groupings"
          accent="burgundy"
        />
        <StatCard
          label="Assigned Guests"
          value={totalGuests}
          hint="Assigned across all groups"
          accent="gold"
        />
        <StatCard
          label="Checked In"
          value={totalCheckedIn}
          hint="Admitted from groups"
          accent="emerald"
        />
      </div>

      {/* Create New Group Collapsible Card */}
      <details className="group rounded-2xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden">
        <summary className="flex cursor-pointer items-center justify-between px-6 py-4.5 text-xs sm:text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50/70 select-none">
          <span className="inline-flex items-center gap-2 text-burgundy">
            <HugeiconsIcon icon={Add01Icon} size={16} />
            <span>Create New Invitation Group</span>
          </span>
          <span className="text-xs text-zinc-400 group-open:rotate-180 transition-transform">
            ▼
          </span>
        </summary>
        <form
          action={createGroupAction}
          className="border-t border-zinc-100 bg-zinc-50/40 p-6 space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Group Name *</label>
              <input
                name="name"
                placeholder="e.g. VIP Royal Family, Groom Friends"
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Group Representative</label>
              <input
                name="representative"
                placeholder="Lead contact name"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Contact Phone</label>
              <input
                name="contactPhone"
                placeholder="+234..."
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Description / Notes</label>
              <input
                name="description"
                placeholder="Seating table, arrival guidance..."
                className={inputCls}
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button type="submit" className={btnPrimary}>
              Create Group
            </button>
          </div>
        </form>
      </details>

      {/* Group List */}
      {groups.length === 0 ? (
        <EmptyState
          title="No invitation groups yet"
          description="Create your first invitation group above to begin categorizing guests."
        />
      ) : (
        <div className="space-y-4">
          {groups.map((g) => {
            const update = updateGroupAction.bind(null, g.id);
            const remove = deleteGroupAction.bind(null, g.id);

            return (
              <details
                key={g.id}
                className="group rounded-2xl border border-zinc-200/80 bg-white shadow-xs overflow-hidden"
              >
                <summary className="flex cursor-pointer flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 select-none hover:bg-zinc-50/50 transition">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-base font-bold text-zinc-900 tracking-tight">
                        {g.name}
                      </span>
                      <Badge value={g.status} />
                    </div>
                    {g.representative && (
                      <p className="mt-1 text-xs text-zinc-500">
                        Lead: <span className="font-medium text-zinc-700">{g.representative}</span>
                        {g.contactPhone ? ` · ${g.contactPhone}` : ""}
                      </p>
                    )}
                    {g.description && (
                      <p className="mt-0.5 text-xs text-zinc-400 italic">
                        {g.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-6 text-center text-xs text-zinc-500 shrink-0">
                    <div className="rounded-xl bg-zinc-50 border border-zinc-100 px-3.5 py-2">
                      <p className="text-base font-bold text-zinc-900 font-mono">
                        {g.guestCount}
                      </p>
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400">
                        Guests
                      </span>
                    </div>
                    <div className="rounded-xl bg-blue-50/60 border border-blue-100 px-3.5 py-2">
                      <p className="text-base font-bold text-blue-700 font-mono">
                        {g.registeredCount}
                      </p>
                      <span className="text-[10px] uppercase tracking-wider text-blue-500">
                        Registered
                      </span>
                    </div>
                    <div className="rounded-xl bg-emerald-50/60 border border-emerald-100 px-3.5 py-2">
                      <p className="text-base font-bold text-emerald-700 font-mono">
                        {g.checkedInCount}
                      </p>
                      <span className="text-[10px] uppercase tracking-wider text-emerald-500">
                        Admitted
                      </span>
                    </div>
                  </div>
                </summary>

                {/* Edit & Management Drawer/Panel */}
                <div className="border-t border-zinc-100 bg-zinc-50/40 p-6 space-y-5">
                  <form action={update} className="space-y-4">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                      Edit Group Details
                    </h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelCls}>Name</label>
                        <input
                          name="name"
                          defaultValue={g.name}
                          className={inputCls}
                          required
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Representative</label>
                        <input
                          name="representative"
                          defaultValue={g.representative ?? ""}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Contact Phone</label>
                        <input
                          name="contactPhone"
                          defaultValue={g.contactPhone ?? ""}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Status</label>
                        <select
                          name="status"
                          defaultValue={g.status}
                          className={inputCls}
                        >
                          <option value="active">Active</option>
                          <option value="archived">Archived</option>
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className={labelCls}>Description</label>
                        <input
                          name="description"
                          defaultValue={g.description ?? ""}
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <a
                        href={`/admin/guests?group=${g.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-burgundy hover:underline"
                      >
                        <HugeiconsIcon icon={UserGroupIcon} size={15} />
                        <span>View {g.guestCount} assigned guests</span>
                        <HugeiconsIcon icon={ArrowRight01Icon} size={13} />
                      </a>
                      <button type="submit" className={btnPrimary}>
                        Save Group Changes
                      </button>
                    </div>
                  </form>

                  <div className="border-t border-zinc-200/60 pt-4 flex items-center justify-between">
                    <p className="text-xs text-zinc-400">
                      Deleting unassigns all guests without deleting their records.
                    </p>
                    <form action={remove}>
                      <button
                        type="submit"
                        className={btnDanger}
                      >
                        Delete Group
                      </button>
                    </form>
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </div>
  );
}
