"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { checkIns, guests, registrations, tickets } from "@/db/schema";
import { authorize } from "@/lib/auth/permissions";
import { audit } from "@/lib/audit";
import { attendeeCodeFromId, normalizePhone } from "@/lib/constants";
import { enqueueAndSend } from "@/lib/email/outbox";
import { invitationResendEmail } from "@/lib/email/templates";
import { reissueTicket } from "@/services/registration.service";

export type ActionResult = { ok: boolean; message: string };

function fail(message: string): ActionResult {
  return { ok: false, message };
}

const guestFormSchema = z.object({
  fullName: z.string().trim().min(2).max(200),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  groupId: z.coerce.number().int().optional(),
  invitedBy: z.string().trim().max(200).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  attendanceResponse: z
    .enum(["definitely", "likely", "unsure", "declined", ""])
    .optional(),
});

/** Manual guest creation by an administrator (status: registered + ticket). */
export async function createGuestAction(formData: FormData): Promise<ActionResult> {
  const session = await authorize("manage_guests");
  const parsed = guestFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Please check the guest details");
  const data = parsed.data;

  const guestId = await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(guests)
      .values({
        fullName: data.fullName,
        email: data.email?.toLowerCase() || null,
        phone: data.phone || null,
        phoneNormalized: normalizePhone(data.phone),
        groupId: data.groupId || null,
        invitedBy: data.invitedBy || null,
        notes: data.notes || null,
        source: "admin",
        status: "registered",
      })
      .returning({ id: guests.id });
    await tx
      .update(guests)
      .set({ attendeeCode: attendeeCodeFromId(created.id) })
      .where(eq(guests.id, created.id));
    await tx.insert(registrations).values({
      guestId: created.id,
      invitedBy: data.invitedBy || null,
      attendanceResponse: data.attendanceResponse || null,
      consent: true,
    });
    const { generateTicketToken, hashToken } = await import("@/lib/qr/tokens");
    const token = generateTicketToken();
    await tx.insert(tickets).values({
      guestId: created.id,
      tokenHash: hashToken(token),
      status: "active",
    });
    return created.id;
  });

  await audit({
    userId: session.id,
    action: "guest.create",
    entityType: "guest",
    entityId: guestId,
    detail: { fullName: data.fullName },
  });
  revalidatePath("/admin/guests");
  return { ok: true, message: "Guest added" };
}

export async function updateGuestAction(
  guestId: number,
  formData: FormData,
): Promise<ActionResult> {
  const session = await authorize("manage_guests");
  const parsed = guestFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fail("Please check the guest details");
  const data = parsed.data;

  await db
    .update(guests)
    .set({
      fullName: data.fullName,
      email: data.email?.toLowerCase() || null,
      phone: data.phone || null,
      phoneNormalized: normalizePhone(data.phone),
      groupId: data.groupId || null,
      invitedBy: data.invitedBy || null,
      notes: data.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(guests.id, guestId));

  if (data.attendanceResponse) {
    await db
      .update(registrations)
      .set({ attendanceResponse: data.attendanceResponse, updatedAt: new Date() })
      .where(eq(registrations.guestId, guestId));
  }

  await audit({
    userId: session.id,
    action: "guest.update",
    entityType: "guest",
    entityId: guestId,
  });
  revalidatePath("/admin/guests");
  revalidatePath(`/admin/guests/${guestId}`);
  return { ok: true, message: "Guest updated" };
}

export async function confirmRegistrationAction(guestId: number): Promise<ActionResult> {
  const session = await authorize("manage_guests");
  await db
    .update(guests)
    .set({ status: "confirmed", updatedAt: new Date() })
    .where(and(eq(guests.id, guestId), eq(guests.status, "registered")));
  await audit({
    userId: session.id,
    action: "guest.confirm",
    entityType: "guest",
    entityId: guestId,
  });
  revalidatePath(`/admin/guests/${guestId}`);
  revalidatePath("/admin/guests");
  return { ok: true, message: "Registration confirmed" };
}

/** Deactivate admission credentials: revoke guest + active tickets. */
export async function revokeGuestAction(guestId: number): Promise<ActionResult> {
  const session = await authorize("manage_guests");
  await db.transaction(async (tx) => {
    await tx
      .update(guests)
      .set({ status: "revoked", updatedAt: new Date() })
      .where(eq(guests.id, guestId));
    await tx
      .update(tickets)
      .set({ status: "revoked", revokedAt: new Date() })
      .where(and(eq(tickets.guestId, guestId), eq(tickets.status, "active")));
  });
  await audit({
    userId: session.id,
    action: "guest.revoke",
    entityType: "guest",
    entityId: guestId,
  });
  revalidatePath(`/admin/guests/${guestId}`);
  revalidatePath("/admin/guests");
  return { ok: true, message: "Admission credentials deactivated" };
}

/** Reactivate a valid registration and issue a fresh ticket. */
export async function reactivateGuestAction(guestId: number): Promise<ActionResult> {
  const session = await authorize("manage_guests");
  await db
    .update(guests)
    .set({ status: "registered", updatedAt: new Date() })
    .where(eq(guests.id, guestId));
  await reissueTicket(guestId);
  await audit({
    userId: session.id,
    action: "guest.reactivate",
    entityType: "guest",
    entityId: guestId,
  });
  revalidatePath(`/admin/guests/${guestId}`);
  revalidatePath("/admin/guests");
  return { ok: true, message: "Guest reactivated with a new ticket" };
}

/** Resend the invitation: rotates the ticket and emails the new link. */
export async function resendInvitationAction(guestId: number): Promise<ActionResult> {
  const session = await authorize("manage_guests");
  const guest = await db.query.guests.findFirst({ where: eq(guests.id, guestId) });
  if (!guest) return fail("Guest not found");
  if (!guest.email) return fail("This guest has no email address on record");
  if (guest.status === "revoked") return fail("Guest is revoked — reactivate first");

  const token = await reissueTicket(guestId);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const mail = invitationResendEmail({
    name: guest.fullName,
    attendeeCode: guest.attendeeCode ?? "",
    invitationUrl: `${appUrl}/invitation/${token}`,
  });
  await enqueueAndSend({
    guestId,
    toEmail: guest.email,
    template: "invitation_resend",
    subject: mail.subject,
    html: mail.html,
    idempotencyKey: `resend:${guestId}:${Date.now()}`,
  });
  await audit({
    userId: session.id,
    action: "guest.resend_invitation",
    entityType: "guest",
    entityId: guestId,
  });
  revalidatePath(`/admin/guests/${guestId}`);
  return { ok: true, message: "Invitation re-issued and queued for delivery" };
}

export async function undoCheckInAction(guestId: number): Promise<ActionResult> {
  const session = await authorize("check_in");
  const removed = await db
    .delete(checkIns)
    .where(eq(checkIns.guestId, guestId))
    .returning({ id: checkIns.id });
  if (removed.length === 0) return fail("Guest was not checked in");
  await audit({
    userId: session.id,
    action: "checkin.undo",
    entityType: "guest",
    entityId: guestId,
  });
  revalidatePath(`/admin/guests/${guestId}`);
  revalidatePath("/admin/check-in");
  return { ok: true, message: "Check-in reversed" };
}

// ---------------------------------------------------------------------------
// CSV import (PRD §5.2)
// ---------------------------------------------------------------------------

const importRowSchema = z.object({
  fullName: z.string().trim().min(2).max(200),
  email: z.string().trim().email().optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  group: z.string().trim().max(200).optional().or(z.literal("")),
  inviter: z.string().trim().max(200).optional().or(z.literal("")),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type ImportSummary = {
  ok: boolean;
  message: string;
  imported: number;
  skippedDuplicates: number;
  errors: Array<{ row: number; message: string }>;
};

export async function importGuestsAction(
  rows: Array<Record<string, string>>,
): Promise<ImportSummary> {
  const session = await authorize("import_csv");
  if (!Array.isArray(rows) || rows.length === 0) {
    return { ok: false, message: "No rows to import", imported: 0, skippedDuplicates: 0, errors: [] };
  }
  if (rows.length > 2000) {
    return { ok: false, message: "Too many rows (max 2000 per import)", imported: 0, skippedDuplicates: 0, errors: [] };
  }

  const groups = await db.query.invitationGroups.findMany();
  const groupByName = new Map(groups.map((g) => [g.name.toLowerCase(), g.id]));

  const existing = await db
    .select({ email: guests.email, phoneNormalized: guests.phoneNormalized })
    .from(guests);
  const seenEmails = new Set(
    existing.map((e) => e.email?.toLowerCase()).filter(Boolean) as string[],
  );
  const seenPhones = new Set(
    existing.map((e) => e.phoneNormalized).filter(Boolean) as string[],
  );

  let imported = 0;
  let skippedDuplicates = 0;
  const errors: Array<{ row: number; message: string }> = [];

  for (let i = 0; i < rows.length; i++) {
    const parsed = importRowSchema.safeParse(rows[i]);
    if (!parsed.success) {
      errors.push({
        row: i + 1,
        message: parsed.error.issues[0]?.message ?? "Invalid row",
      });
      continue;
    }
    const row = parsed.data;
    const email = row.email?.toLowerCase() || null;
    const phoneNorm = normalizePhone(row.phone);

    if ((email && seenEmails.has(email)) || (phoneNorm && seenPhones.has(phoneNorm))) {
      skippedDuplicates++;
      continue;
    }

    const groupId = row.group
      ? (groupByName.get(row.group.toLowerCase()) ?? null)
      : null;

    try {
      await db.transaction(async (tx) => {
        const [created] = await tx
          .insert(guests)
          .values({
            fullName: row.fullName,
            email,
            phone: row.phone || null,
            phoneNormalized: phoneNorm,
            groupId,
            invitedBy: row.inviter || null,
            notes: row.notes || null,
            source: "preloaded",
            status: "preloaded",
          })
          .returning({ id: guests.id });
        await tx
          .update(guests)
          .set({ attendeeCode: attendeeCodeFromId(created.id) })
          .where(eq(guests.id, created.id));
      });
      if (email) seenEmails.add(email);
      if (phoneNorm) seenPhones.add(phoneNorm);
      imported++;
    } catch (err) {
      errors.push({
        row: i + 1,
        message: err instanceof Error ? err.message : "Insert failed",
      });
    }
  }

  await audit({
    userId: session.id,
    action: "guests.import_csv",
    entityType: "guest",
    detail: { imported, skippedDuplicates, errorCount: errors.length },
  });
  revalidatePath("/admin/guests");

  return {
    ok: true,
    message: `Imported ${imported} guest${imported === 1 ? "" : "s"}`,
    imported,
    skippedDuplicates,
    errors: errors.slice(0, 50),
  };
}
