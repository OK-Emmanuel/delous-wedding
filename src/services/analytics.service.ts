import { sql } from "drizzle-orm";
import { db } from "@/db";
import { checkIns, guests, invitationGroups, registrations } from "@/db/schema";

export async function dashboardStats() {
  const [counts] = await db
    .select({
      totalGuests: sql<number>`count(*) filter (where ${guests.status} != 'revoked')::int`,
      preloaded: sql<number>`count(*) filter (where ${guests.source} = 'preloaded')::int`,
      preloadedPending: sql<number>`count(*) filter (where ${guests.status} = 'preloaded')::int`,
      registered: sql<number>`count(*) filter (where ${guests.status} in ('registered','confirmed'))::int`,
      confirmed: sql<number>`count(*) filter (where ${guests.status} = 'confirmed')::int`,
      publicRegistrations: sql<number>`count(*) filter (where ${guests.source} = 'public' and ${guests.status} != 'revoked')::int`,
      revoked: sql<number>`count(*) filter (where ${guests.status} = 'revoked')::int`,
    })
    .from(guests);

  const [checkedIn] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(checkIns);

  const attendance = await db
    .select({
      response: registrations.attendanceResponse,
      count: sql<number>`count(*)::int`,
    })
    .from(registrations)
    .groupBy(registrations.attendanceResponse);

  // Registrations per day, last 14 days
  const trend = await db
    .select({
      day: sql<string>`to_char(${registrations.createdAt} at time zone 'Africa/Lagos', 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(registrations)
    .where(sql`${registrations.createdAt} > now() - interval '14 days'`)
    .groupBy(sql`1`)
    .orderBy(sql`1`);

  const groupDistribution = await db
    .select({
      name: sql<string>`coalesce(${invitationGroups.name}, 'Unassigned')`,
      count: sql<number>`count(${guests.id})::int`,
      checkedIn: sql<number>`count(${checkIns.id})::int`,
    })
    .from(guests)
    .leftJoin(invitationGroups, sql`${guests.groupId} = ${invitationGroups.id}`)
    .leftJoin(checkIns, sql`${checkIns.guestId} = ${guests.id}`)
    .where(sql`${guests.status} != 'revoked'`)
    .groupBy(sql`1`)
    .orderBy(sql`2 desc`);

  const preloadedRegistered = counts.preloaded - counts.preloadedPending;
  const registrationRate =
    counts.preloaded > 0
      ? Math.round((preloadedRegistered / counts.preloaded) * 100)
      : null;
  const checkInRate =
    counts.registered > 0
      ? Math.round((checkedIn.count / counts.registered) * 100)
      : 0;

  return {
    ...counts,
    checkedIn: checkedIn.count,
    outstanding: counts.registered - checkedIn.count,
    preloadedRegistered,
    registrationRate,
    checkInRate,
    attendance,
    trend,
    groupDistribution,
  };
}
