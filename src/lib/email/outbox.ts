import { db } from "@/db";
import { emailOutbox } from "@/db/schema";
import { eq, inArray, sql } from "drizzle-orm";

type EnqueueInput = {
  guestId?: number | null;
  toEmail: string;
  template: string;
  subject: string;
  html: string;
  /** Prevents duplicate sends when a request is retried. */
  idempotencyKey: string;
};

/**
 * Durable email queue (PRD §10.4). Insert is idempotent; delivery happens
 * after the calling transaction commits, and failures stay queued for retry.
 */
export async function enqueueEmail(input: EnqueueInput): Promise<number | null> {
  const rows = await db
    .insert(emailOutbox)
    .values({
      guestId: input.guestId ?? null,
      toEmail: input.toEmail,
      template: input.template,
      subject: input.subject,
      html: input.html,
      idempotencyKey: input.idempotencyKey,
    })
    .onConflictDoNothing({ target: emailOutbox.idempotencyKey })
    .returning({ id: emailOutbox.id });
  return rows[0]?.id ?? null;
}

/** Attempt delivery of one queued email via SendGrid. Never throws. */
export async function attemptDelivery(outboxId: number): Promise<boolean> {
  const [row] = await db
    .select()
    .from(emailOutbox)
    .where(eq(emailOutbox.id, outboxId));
  if (!row || row.status === "sent" || row.status === "delivered") return true;

  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    // No provider configured (e.g. local development) — leave queued.
    console.log(
      `[email outbox] no SENDGRID_API_KEY — "${row.subject}" to ${row.toEmail} stays pending`,
    );
    return false;
  }

  try {
    const sgMail = (await import("@sendgrid/mail")).default;
    sgMail.setApiKey(apiKey);
    const [response] = await sgMail.send({
      to: row.toEmail,
      from: process.env.SENDGRID_FROM ?? "DELOUS '26 <invites@delous26.com>",
      subject: row.subject,
      html: row.html,
    });
    const messageId = (response.headers["x-message-id"] as string | undefined) ?? null;
    await db
      .update(emailOutbox)
      .set({
        status: "sent",
        providerId: messageId,
        sentAt: new Date(),
        attempts: sql`${emailOutbox.attempts} + 1`,
        lastError: null,
      })
      .where(eq(emailOutbox.id, outboxId));
    return true;
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[email outbox] SendGrid delivery failed for ${row.toEmail}:`, errorMessage);
    await db
      .update(emailOutbox)
      .set({
        status: "failed",
        attempts: sql`${emailOutbox.attempts} + 1`,
        lastError: errorMessage,
      })
      .where(eq(emailOutbox.id, outboxId));
    return false;
  }
}

export async function enqueueAndSend(input: EnqueueInput) {
  const id = await enqueueEmail(input);
  if (id != null) {
    // Fire-and-forget: registration must not fail because email delivery did.
    attemptDelivery(id).catch(() => {});
  }
}

/** Retry all pending/failed emails (admin action). */
export async function retryOutbox(limit = 50): Promise<number> {
  const rows = await db
    .select({ id: emailOutbox.id })
    .from(emailOutbox)
    .where(inArray(emailOutbox.status, ["pending", "failed"]))
    .limit(limit);
  let sent = 0;
  for (const row of rows) {
    if (await attemptDelivery(row.id)) sent++;
  }
  return sent;
}
