import { db } from "@/db";
import { guests, registrations, tickets } from "@/db/schema";
import { attendeeCodeFromId, normalizePhone } from "@/lib/constants";
import { generateTicketToken, hashToken } from "@/lib/qr/tokens";
import type { RegistrationInput } from "@/lib/validation/registration";
import { and, eq, isNotNull, ne, sql } from "drizzle-orm";

export type RegistrationResult = {
  guestId: number;
  attendeeCode: string;
  /** Raw token — only ever returned here and sent to the guest. */
  ticketToken: string;
  matchedPreloaded: boolean;
  alreadyRegistered: boolean;
};

/**
 * Registration workflow (PRD §5.4): match preloaded guests by verified email
 * or normalised phone, never by name; create/update attendee, registration
 * and ticket inside one transaction.
 */
export async function registerGuest(
  input: RegistrationInput,
): Promise<RegistrationResult> {
  const email = input.email.toLowerCase();
  const phoneNorm = normalizePhone(input.phone);

  return db.transaction(async (tx) => {
    // 1. Match an existing record: exact email first, then normalised phone.
    const [byEmail] = await tx
      .select()
      .from(guests)
      .where(and(sql`lower(${guests.email}) = ${email}`, ne(guests.status, "revoked")))
      .limit(1);

    let existing = byEmail;
    if (!existing && phoneNorm) {
      const [byPhone] = await tx
        .select()
        .from(guests)
        .where(
          and(
            isNotNull(guests.phoneNormalized),
            eq(guests.phoneNormalized, phoneNorm),
            ne(guests.status, "revoked"),
          ),
        )
        .limit(1);
      existing = byPhone;
    }

    const matchedPreloaded = !!existing && existing.status === "preloaded";
    const alreadyRegistered = !!existing && existing.status !== "preloaded";

    let guestId: number;
    if (existing) {
      // Update the existing attendee record instead of creating a duplicate.
      guestId = existing.id;
      await tx
        .update(guests)
        .set({
          fullName: input.fullName,
          email,
          phone: input.phone,
          phoneNormalized: phoneNorm,
          invitedBy: input.invitedBy,
          status: existing.status === "preloaded" ? "registered" : existing.status,
          updatedAt: new Date(),
        })
        .where(eq(guests.id, guestId));
    } else {
      const [created] = await tx
        .insert(guests)
        .values({
          fullName: input.fullName,
          email,
          phone: input.phone,
          phoneNormalized: phoneNorm,
          invitedBy: input.invitedBy,
          source: "public",
          status: "registered",
        })
        .returning({ id: guests.id });
      guestId = created.id;
    }

    // 2. Unique sequential-looking attendee code (never a credential).
    const attendeeCode = attendeeCodeFromId(guestId);
    await tx
      .update(guests)
      .set({ attendeeCode })
      .where(and(eq(guests.id, guestId), sql`${guests.attendeeCode} IS NULL`));

    // 3. Upsert the registration (one active registration per guest).
    await tx
      .insert(registrations)
      .values({
        guestId,
        relationship: input.relationship,
        invitedBy: input.invitedBy,
        attendanceResponse: input.attendanceResponse,
        consent: true,
      })
      .onConflictDoUpdate({
        target: registrations.guestId,
        set: {
          relationship: input.relationship,
          invitedBy: input.invitedBy,
          attendanceResponse: input.attendanceResponse,
          consent: true,
          updatedAt: new Date(),
        },
      });

    // 4. Issue a ticket if the guest does not already hold an active one.
    const [activeTicket] = await tx
      .select({ id: tickets.id })
      .from(tickets)
      .where(and(eq(tickets.guestId, guestId), eq(tickets.status, "active")))
      .limit(1);

    let ticketToken = "";
    if (!activeTicket) {
      ticketToken = generateTicketToken();
      await tx.insert(tickets).values({
        guestId,
        tokenHash: hashToken(ticketToken),
        status: "active",
      });
    }

    const [finalGuest] = await tx
      .select({ attendeeCode: guests.attendeeCode })
      .from(guests)
      .where(eq(guests.id, guestId));

    return {
      guestId,
      attendeeCode: finalGuest.attendeeCode ?? attendeeCode,
      ticketToken,
      matchedPreloaded,
      alreadyRegistered,
    };
  });
}

/**
 * Rotate (or first-issue) a guest's ticket: revoke any active ticket and
 * issue a fresh token. Used for admin resend/reissue and ticket recovery.
 */
export async function reissueTicket(guestId: number): Promise<string> {
  return db.transaction(async (tx) => {
    await tx
      .update(tickets)
      .set({ status: "revoked", revokedAt: new Date() })
      .where(and(eq(tickets.guestId, guestId), eq(tickets.status, "active")));
    const token = generateTicketToken();
    await tx.insert(tickets).values({
      guestId,
      tokenHash: hashToken(token),
      status: "active",
    });
    return token;
  });
}
