"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { users } from "@/db/schema";
import { authorize } from "@/lib/auth/permissions";
import { audit } from "@/lib/audit";

export type StaffActionResult = { ok: boolean; message: string };

const staffSchema = z.object({
  name: z.string().trim().min(2).max(200),
  email: z.string().trim().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["super_admin", "admin", "checkin_officer", "content_manager"]),
});

export async function createStaffAction(
  formData: FormData,
): Promise<StaffActionResult> {
  const session = await authorize("manage_staff");
  const parsed = staffSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;
  const [created] = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: await bcrypt.hash(data.password, 10),
      role: data.role,
    })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });
  if (!created) return { ok: false, message: "A user with this email already exists" };
  await audit({
    userId: session.id,
    action: "staff.create",
    entityType: "user",
    entityId: created.id,
    detail: { role: data.role },
  });
  revalidatePath("/admin/staff");
  return { ok: true, message: "Staff account created" };
}

export async function updateStaffRoleAction(
  userId: number,
  formData: FormData,
): Promise<StaffActionResult> {
  const session = await authorize("manage_staff");
  if (userId === session.id) {
    return { ok: false, message: "You cannot change your own role" };
  }
  const role = String(formData.get("role"));
  const status = String(formData.get("status"));
  if (!["super_admin", "admin", "checkin_officer", "content_manager"].includes(role)) {
    return { ok: false, message: "Invalid role" };
  }
  await db
    .update(users)
    .set({
      role: role as (typeof users.role.enumValues)[number],
      status: status === "disabled" ? "disabled" : "active",
    })
    .where(eq(users.id, userId));
  await audit({
    userId: session.id,
    action: "staff.update",
    entityType: "user",
    entityId: userId,
    detail: { role, status },
  });
  revalidatePath("/admin/staff");
  return { ok: true, message: "Staff updated" };
}

export async function resetStaffPasswordAction(
  userId: number,
  formData: FormData,
): Promise<StaffActionResult> {
  const session = await authorize("manage_staff");
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters" };
  }
  await db
    .update(users)
    .set({ passwordHash: await bcrypt.hash(password, 10) })
    .where(eq(users.id, userId));
  await audit({
    userId: session.id,
    action: "staff.reset_password",
    entityType: "user",
    entityId: userId,
  });
  revalidatePath("/admin/staff");
  return { ok: true, message: "Password reset" };
}
