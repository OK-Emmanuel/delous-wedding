"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import { authorize } from "@/lib/auth/permissions";
import { audit } from "@/lib/audit";

const faqSchema = z.object({
  question: z.string().trim().min(5).max(500),
  answer: z.string().trim().min(2).max(5000),
  sortOrder: z.coerce.number().int().min(0).default(0),
  status: z.enum(["draft", "published"]).default("published"),
});

function revalidate() {
  revalidatePath("/admin/faqs");
  revalidatePath("/faqs");
  revalidatePath("/");
}

export async function createFaqAction(formData: FormData) {
  const session = await authorize("manage_faqs");
  const parsed = faqSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  const [created] = await db
    .insert(faqs)
    .values(parsed.data)
    .returning({ id: faqs.id });
  await audit({
    userId: session.id,
    action: "faq.create",
    entityType: "faq",
    entityId: created.id,
  });
  revalidate();
}

export async function updateFaqAction(id: number, formData: FormData) {
  const session = await authorize("manage_faqs");
  const parsed = faqSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  await db.update(faqs).set(parsed.data).where(eq(faqs.id, id));
  await audit({
    userId: session.id,
    action: "faq.update",
    entityType: "faq",
    entityId: id,
  });
  revalidate();
}

export async function deleteFaqAction(id: number) {
  const session = await authorize("manage_faqs");
  await db.delete(faqs).where(eq(faqs.id, id));
  await audit({
    userId: session.id,
    action: "faq.delete",
    entityType: "faq",
    entityId: id,
  });
  revalidate();
}
