"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { gallery } from "@/db/schema";
import { authorize } from "@/lib/auth/permissions";
import { audit } from "@/lib/audit";

const itemSchema = z.object({
  imageUrl: z.string().trim().url("Enter a valid image URL"),
  caption: z.string().trim().max(255).optional().or(z.literal("")),
  altText: z.string().trim().max(255).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).default(0),
  status: z.enum(["draft", "published"]).default("draft"),
});

function revalidate() {
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
  revalidatePath("/");
}

export async function createGalleryItemAction(formData: FormData) {
  const session = await authorize("manage_gallery");
  const parsed = itemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const d = parsed.data;
  const [created] = await db
    .insert(gallery)
    .values({
      imageUrl: d.imageUrl,
      caption: d.caption || null,
      altText: d.altText || null,
      sortOrder: d.sortOrder,
      status: d.status,
    })
    .returning({ id: gallery.id });
  await audit({
    userId: session.id,
    action: "gallery.create",
    entityType: "gallery",
    entityId: created.id,
  });
  revalidate();
}

export async function updateGalleryItemAction(id: number, formData: FormData) {
  const session = await authorize("manage_gallery");
  const parsed = itemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const d = parsed.data;
  await db
    .update(gallery)
    .set({
      imageUrl: d.imageUrl,
      caption: d.caption || null,
      altText: d.altText || null,
      sortOrder: d.sortOrder,
      status: d.status,
    })
    .where(eq(gallery.id, id));
  await audit({
    userId: session.id,
    action: "gallery.update",
    entityType: "gallery",
    entityId: id,
  });
  revalidate();
}

export async function deleteGalleryItemAction(id: number) {
  const session = await authorize("manage_gallery");
  await db.delete(gallery).where(eq(gallery.id, id));
  await audit({
    userId: session.id,
    action: "gallery.delete",
    entityType: "gallery",
    entityId: id,
  });
  revalidate();
}
