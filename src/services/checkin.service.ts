import { db } from "@/db";
import { checkIns, guests, registrations, tickets } from "@/db/schema";
import { attendeeCodeFromId, normalizePhone } from "@/lib/constants";
import { hashToken } from "@/lib/qr/tokens";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";

export type ScanResult =
  | { status: "admitted"; guest: GuestSummary; checkedInAt: string }
  | { status: "already_checked_in"; guest: GuestSummary; checkedInAt: string }
  | { status: "revoked"; guest: GuestSummary | null }
  | { status: "invalid" };

export type GuestSummary = {
  id: number;
  attendeeCode: string | null;
  fullName: string;
  groupName: string | null;
  registrationStatus: string;
};

async function guestSummary(guestId: number): Promise<GuestSummary | null> {
  const row = await db.query.guests.findFirst({
    where: eq(guests.id, guestId),
    with: { group: true },
  });
  if (!row) return null;
  return {
    id: row.id,
    attendeeCode: row.attendeeCode,
    fullName: row.fullName,
    groupName: row.group?.name ?? null,
    registrationStatus: row.status,
  };
}

/**
 * Atomic admission (PRD §10.3): lock the ticket row, verify status, insert
 * the check-in. A unique index on check_ins.ticket_id is the final safeguard
 * against two officers admitting the same ticket simultaneously.
 */
export async function checkInByToken(
  rawToken: string,
  officerId: number,
): Promise<ScanResult> {
  const tokenHash = hashToken(rawToken);

  return db.transaction(async (tx) => {
    const [ticket] = await tx
      .select()
      .from(tickets)
      .where(eq(tickets.tokenHash, tokenHash))
      .for("update")
      .limit(1);

    if (!ticket) return { status: "invalid" as const };

    const guest = await guestSummary(ticket.guestId);
    if (!guest) return { status: "invalid" as const };

    if (ticket.status !== "active" || guest.registrationStatus === "revoked") {
      return { status: "revoked" as const, guest };
    }

    const [existing] = await tx
      .select()
      .from(checkIns)
      .where(eq(checkIns.ticketId, ticket.id))
      .limit(1);
    if (existing) {
      return {
        status: "already_checked_in" as const,
        guest,
        checkedInAt: existing.checkedInAt.toISOString(),
      };
    }

    try {
      const [inserted] = await tx
        .insert(checkIns)
        .values({
          ticketId: ticket.id,
          guestId: ticket.guestId,
          officerId,
          method: "qr",
        })
        .returning();
      return {
        status: "admitted" as const,
        guest,
        checkedInAt: inserted.checkedInAt.toISOString(),
      };
    } catch {
      // Unique-constraint race: someone else admitted this ticket first.
      return { status: "already_checked_in" as const, guest, checkedInAt: new Date().toISOString() };
    }
  });
}

/** Manual check-in from the search station (by guest id). */
export async function checkInManually(
  guestId: number,
  officerId: number,
): Promise<ScanResult> {
  return db.transaction(async (tx) => {
    const [ticket] = await tx
      .select()
      .from(tickets)
      .where(and(eq(tickets.guestId, guestId), eq(tickets.status, "active")))
      .for("update")
      .limit(1);

    const guest = await guestSummary(guestId);
    if (!guest) return { status: "invalid" as const };
    if (!ticket || guest.registrationStatus === "revoked")
      return { status: "revoked" as const, guest };

    const [existing] = await tx
      .select()
      .from(checkIns)
      .where(eq(checkIns.guestId, guestId))
      .limit(1);
    if (existing) {
      return {
        status: "already_checked_in" as const,
        guest,
        checkedInAt: existing.checkedInAt.toISOString(),
      };
    }

    try {
      const [inserted] = await tx
        .insert(checkIns)
        .values({ ticketId: ticket.id, guestId, officerId, method: "manual" })
        .returning();
      return {
        status: "admitted" as const,
        guest,
        checkedInAt: inserted.checkedInAt.toISOString(),
      };
    } catch {
      return {
        status: "already_checked_in" as const,
        guest,
        checkedInAt: new Date().toISOString(),
      };
    }
  });
}

/** Reverse a mistaken check-in (lifted from the Tosin & Kenny system). */
export async function undoCheckIn(guestId: number): Promise<boolean> {
  const deleted = await db
    .delete(checkIns)
    .where(eq(checkIns.guestId, guestId))
    .returning({ id: checkIns.id });
  return deleted.length > 0;
}

export type SearchRow = {
  id: number;
  attendeeCode: string | null;
  fullName: string;
  email: string | null;
  phone: string | null;
  status: string;
  groupName: string | null;
  checkedInAt: string | null;
  hasActiveTicket: boolean;
};

/** Fast attendee search for the manual check-in station. */
export async function searchAttendees(query: string, limit = 10): Promise<SearchRow[]> {
  const q = `%${query.trim()}%`;
  const rows = await db.query.guests.findMany({
    where: or(
      ilike(guests.fullName, q),
      ilike(guests.attendeeCode, q),
      ilike(guests.email, q),
      ilike(guests.phone, q),
    ),
    with: { group: true, checkIn: true, tickets: true },
    limit,
    orderBy: [guests.fullName],
  });
  return rows.map((r) => ({
    id: r.id,
    attendeeCode: r.attendeeCode,
    fullName: r.fullName,
    email: r.email,
    phone: r.phone,
    status: r.status,
    groupName: r.group?.name ?? null,
    checkedInAt: r.checkIn?.checkedInAt?.toISOString() ?? null,
    hasActiveTicket: r.tickets.some((t) => t.status === "active"),
  }));
}

export async function checkInStats() {
  const [row] = await db
    .select({
      total: sql<number>`count(*)::int`,
      registered: sql<number>`count(*) filter (where ${guests.status} in ('registered','confirmed'))::int`,
      checkedIn: sql<number>`(select count(*) from ${checkIns})::int`,
    })
    .from(guests)
    .where(sql`${guests.status} != 'revoked'`);
  return row;
}

export async function recentCheckIns(limit = 25) {
  const rows = await db.query.checkIns.findMany({
    with: { guest: { with: { group: true } }, officer: true },
    orderBy: [desc(checkIns.checkedInAt)],
    limit,
  });
  return rows.map((r) => ({
    id: r.id,
    guestId: r.guestId,
    fullName: r.guest.fullName,
    attendeeCode: r.guest.attendeeCode,
    groupName: r.guest.group?.name ?? null,
    officer: r.officer?.name ?? null,
    method: r.method,
    checkedInAt: r.checkedInAt.toISOString(),
  }));
}

/**
 * On-spot walk-in registration at the gate (lifted from the Tosin & Kenny
 * "Register on Spot" feature): creates guest + registration + ticket, and
 * optionally checks them in immediately.
 */
export async function registerOnSpot(
  input: {
    fullName: string;
    phone?: string;
    groupId?: number | null;
    autoCheckIn: boolean;
  },
  officerId: number,
) {
  return db.transaction(async (tx) => {
    const [created] = await tx
      .insert(guests)
      .values({
        fullName: input.fullName.trim(),
        phone: input.phone?.trim() || null,
        phoneNormalized: normalizePhone(input.phone),
        groupId: input.groupId ?? null,
        source: "onspot",
        status: "confirmed",
        invitedBy: "On-spot registration",
      })
      .returning({ id: guests.id });

    const attendeeCode = attendeeCodeFromId(created.id);
    await tx
      .update(guests)
      .set({ attendeeCode })
      .where(eq(guests.id, created.id));

    await tx.insert(registrations).values({
      guestId: created.id,
      attendanceResponse: "definitely",
      invitedBy: "On-spot registration",
      consent: true,
    });

    const { generateTicketToken, hashToken: hash } = await import(
      "@/lib/qr/tokens"
    );
    const token = generateTicketToken();
    const [ticket] = await tx
      .insert(tickets)
      .values({ guestId: created.id, tokenHash: hash(token), status: "active" })
      .returning({ id: tickets.id });

    if (input.autoCheckIn) {
      await tx.insert(checkIns).values({
        ticketId: ticket.id,
        guestId: created.id,
        officerId,
        method: "manual",
      });
    }

    return { guestId: created.id, attendeeCode };
  });
}
