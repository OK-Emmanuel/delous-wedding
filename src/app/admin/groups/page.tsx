import { asc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { checkIns, guests, invitationGroups } from "@/db/schema";
import { requirePermission } from "@/lib/auth/permissions";
import {
  Badge,
  EmptyState,
  PageHeader,
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

  return (
    <>
      <PageHeader
        title="Invitation Groups"
        description="Organisational tool for guest management — groups are not shared invitations."
      />

      {/* Create */}
      <details className="mb-5 rounded-xl border border-slate-200 bg-white shadow-sm">
        <summary className="cursor-pointer px-5 py-4 text-sm font-medium text-burgundy">
          + Create a new group
        </summary>
        <form action={createGroupAction} className="grid gap-4 border-t border-slate-100 p-5 md:grid-cols-2">
          <div>
            <label className={labelCls}>Name *</label>
            <input name="name" className={inputCls} required />
          </div>
          <div>
            <label className={labelCls}>Group representative</label>
            <input name="representative" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Contact phone</label>
            <input name="contactPhone" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <input name="description" className={inputCls} />
          </div>
          <div>
            <button className={btnPrimary}>Create Group</button>
          </div>
        </form>
      </details>

      {groups.length === 0 ? (
        <EmptyState title="No groups yet" description="Create your first invitation group above." />
      ) : (
        <div className="space-y-3">
          {groups.map((g) => {
            const update = updateGroupAction.bind(null, g.id);
            const remove = deleteGroupAction.bind(null, g.id);
            return (
              <details key={g.id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <span className="font-medium text-slate-800">{g.name}</span>{" "}
                    <Badge value={g.status} />
                    {g.representative && (
                      <p className="text-xs text-slate-500">
                        Rep: {g.representative}
                        {g.contactPhone ? ` · ${g.contactPhone}` : ""}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-5 text-center text-xs text-slate-500">
                    <div>
                      <p className="text-lg font-semibold text-slate-800">{g.guestCount}</p>
                      guests
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-blue-700">{g.registeredCount}</p>
                      registered
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-emerald-700">{g.checkedInCount}</p>
                      checked in
                    </div>
                  </div>
                </summary>
                <div className="border-t border-slate-100 p-5">
                  <form action={update} className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className={labelCls}>Name</label>
                      <input name="name" defaultValue={g.name} className={inputCls} required />
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
                      <label className={labelCls}>Contact phone</label>
                      <input
                        name="contactPhone"
                        defaultValue={g.contactPhone ?? ""}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Description</label>
                      <input
                        name="description"
                        defaultValue={g.description ?? ""}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Status</label>
                      <select name="status" defaultValue={g.status} className={inputCls}>
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div className="flex items-end gap-2">
                      <button className={btnPrimary}>Save</button>
                    </div>
                  </form>
                  <form action={remove} className="mt-3 border-t border-slate-100 pt-3">
                    <button className={btnDanger}>
                      Delete group (guests are kept and unassigned)
                    </button>
                  </form>
                  <a
                    href={`/admin/guests?group=${g.id}`}
                    className={`${btnSecondary} mt-3`}
                  >
                    View assigned guests →
                  </a>
                </div>
              </details>
            );
          })}
        </div>
      )}
    </>
  );
}
