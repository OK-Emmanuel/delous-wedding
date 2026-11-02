"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { invitationGroups } from "@/db/schema";
import { authorize } from "@/lib/auth/permissions";
import { audit } from "@/lib/audit";

const groupSchema = z.object({
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  representative: z.string().trim().max(200).optional().or(z.literal("")),
  contactPhone: z.string().trim().max(50).optional().or(z.literal("")),
});

export async function createGroupAction(formData: FormData) {
  const session = await authorize("manage_groups");
  const parsed = groupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const data = parsed.data;
  const [created] = await db
    .insert(invitationGroups)
    .values({
      name: data.name,
      description: data.description || null,
      representative: data.representative || null,
      contactPhone: data.contactPhone || null,
    })
    .onConflictDoNothing({ target: invitationGroups.name })
    .returning({ id: invitationGroups.id });
  if (created) {
    await audit({
      userId: session.id,
      action: "group.create",
      entityType: "group",
      entityId: created.id,
      detail: { name: data.name },
    });
  }
  revalidatePath("/admin/groups");
}

export async function updateGroupAction(groupId: number, formData: FormData) {
  const session = await authorize("manage_groups");
  const parsed = groupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const data = parsed.data;
  await db
    .update(invitationGroups)
    .set({
      name: data.name,
      description: data.description || null,
      representative: data.representative || null,
      contactPhone: data.contactPhone || null,
      status: formData.get("status") === "archived" ? "archived" : "active",
    })
    .where(eq(invitationGroups.id, groupId));
  await audit({
    userId: session.id,
    action: "group.update",
    entityType: "group",
    entityId: groupId,
  });
  revalidatePath("/admin/groups");
}

/** Deleting a group never deletes its guests (FK sets group to null). */
export async function deleteGroupAction(groupId: number) {
  const session = await authorize("manage_groups");
  await db.delete(invitationGroups).where(eq(invitationGroups.id, groupId));
  await audit({
    userId: session.id,
    action: "group.delete",
    entityType: "group",
    entityId: groupId,
  });
  revalidatePath("/admin/groups");
}
