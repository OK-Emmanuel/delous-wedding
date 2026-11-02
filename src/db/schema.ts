import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "admin",
  "checkin_officer",
  "content_manager",
]);

export const userStatusEnum = pgEnum("user_status", ["active", "disabled"]);

export const guestSourceEnum = pgEnum("guest_source", [
  "preloaded",
  "public",
  "admin",
  "onspot",
]);

// Registration lifecycle per PRD §5.3
export const guestStatusEnum = pgEnum("guest_status", [
  "preloaded",
  "registered",
  "confirmed",
  "revoked",
]);

export const attendanceResponseEnum = pgEnum("attendance_response", [
  "definitely",
  "likely",
  "unsure",
  "declined",
]);

export const relationshipEnum = pgEnum("relationship", [
  "brides_family",
  "grooms_family",
  "brides_friend",
  "grooms_friend",
  "family_friend",
  "colleague",
  "church_member",
  "other",
]);

export const ticketStatusEnum = pgEnum("ticket_status", ["active", "revoked"]);

export const checkInMethodEnum = pgEnum("check_in_method", ["qr", "manual"]);

export const emailStatusEnum = pgEnum("email_status", [
  "pending",
  "sent",
  "delivered",
  "failed",
  "bounced",
]);

export const groupStatusEnum = pgEnum("group_status", ["active", "archived"]);

export const contentStatusEnum = pgEnum("content_status", [
  "draft",
  "published",
]);

// ---------------------------------------------------------------------------
// Admin users & RBAC
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("checkin_officer"),
  status: userStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// Invitation groups (admin-managed organisational tool, not shared invites)
// ---------------------------------------------------------------------------

export const invitationGroups = pgTable("invitation_groups", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  description: text("description"),
  representative: varchar("representative", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 50 }),
  status: groupStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// Guests — one row per individual attendee
// ---------------------------------------------------------------------------

export const guests = pgTable(
  "guests",
  {
    id: serial("id").primaryKey(),
    // e.g. DELOUS-26-000001 — administrative convenience, never a credential
    attendeeCode: varchar("attendee_code", { length: 32 }).unique(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    // digits-only form used for preloaded-guest matching
    phoneNormalized: varchar("phone_normalized", { length: 50 }),
    groupId: integer("group_id").references(() => invitationGroups.id, {
      onDelete: "set null",
    }),
    source: guestSourceEnum("source").notNull().default("public"),
    status: guestStatusEnum("status").notNull().default("registered"),
    invitedBy: varchar("invited_by", { length: 255 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("guests_email_idx").on(t.email),
    index("guests_phone_idx").on(t.phoneNormalized),
    index("guests_group_idx").on(t.groupId),
    index("guests_status_idx").on(t.status),
    index("guests_name_idx").on(t.fullName),
  ],
);

// ---------------------------------------------------------------------------
// Registrations — a guest's submitted registration (one active per guest)
// ---------------------------------------------------------------------------

export const registrations = pgTable(
  "registrations",
  {
    id: serial("id").primaryKey(),
    guestId: integer("guest_id")
      .notNull()
      .unique()
      .references(() => guests.id, { onDelete: "cascade" }),
    relationship: relationshipEnum("relationship"),
    invitedBy: varchar("invited_by", { length: 255 }),
    attendanceResponse: attendanceResponseEnum("attendance_response"),
    consent: boolean("consent").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("registrations_response_idx").on(t.attendanceResponse)],
);

// ---------------------------------------------------------------------------
// Tickets — opaque random token, stored hashed. One active ticket per guest.
// ---------------------------------------------------------------------------

export const tickets = pgTable(
  "tickets",
  {
    id: serial("id").primaryKey(),
    guestId: integer("guest_id")
      .notNull()
      .references(() => guests.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull().unique(),
    status: ticketStatusEnum("status").notNull().default("active"),
    issuedAt: timestamp("issued_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (t) => [index("tickets_guest_idx").on(t.guestId)],
);

// ---------------------------------------------------------------------------
// Check-ins — one successful admission per ticket (DB-enforced)
// ---------------------------------------------------------------------------

export const checkIns = pgTable(
  "check_ins",
  {
    id: serial("id").primaryKey(),
    ticketId: integer("ticket_id")
      .notNull()
      .references(() => tickets.id),
    guestId: integer("guest_id")
      .notNull()
      .references(() => guests.id),
    officerId: integer("officer_id").references(() => users.id),
    method: checkInMethodEnum("method").notNull().default("qr"),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("check_ins_ticket_unique").on(t.ticketId),
    uniqueIndex("check_ins_guest_unique").on(t.guestId),
    index("check_ins_time_idx").on(t.checkedInAt),
  ],
);

// ---------------------------------------------------------------------------
// Email outbox — durable queue with idempotency (PRD §10.4)
// ---------------------------------------------------------------------------

export const emailOutbox = pgTable(
  "email_outbox",
  {
    id: serial("id").primaryKey(),
    guestId: integer("guest_id").references(() => guests.id, {
      onDelete: "set null",
    }),
    toEmail: varchar("to_email", { length: 255 }).notNull(),
    template: varchar("template", { length: 64 }).notNull(),
    subject: varchar("subject", { length: 255 }).notNull(),
    html: text("html").notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 128 })
      .notNull()
      .unique(),
    status: emailStatusEnum("status").notNull().default("pending"),
    providerId: varchar("provider_id", { length: 128 }),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
  },
  (t) => [index("email_outbox_status_idx").on(t.status)],
);

// ---------------------------------------------------------------------------
// One-time codes for secure ticket recovery (PRD §6.3)
// ---------------------------------------------------------------------------

export const verificationCodes = pgTable("verification_codes", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id")
    .notNull()
    .references(() => guests.id, { onDelete: "cascade" }),
  codeHash: varchar("code_hash", { length: 64 }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// Content: gallery & FAQs
// ---------------------------------------------------------------------------

export const gallery = pgTable("gallery", {
  id: serial("id").primaryKey(),
  imageUrl: text("image_url").notNull(),
  caption: varchar("caption", { length: 255 }),
  altText: varchar("alt_text", { length: 255 }),
  sortOrder: integer("sort_order").notNull().default(0),
  status: contentStatusEnum("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: varchar("question", { length: 500 }).notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  status: contentStatusEnum("status").notNull().default("published"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// Audit log for sensitive admin actions
// ---------------------------------------------------------------------------

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: varchar("entity_id", { length: 50 }),
    detail: jsonb("detail"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("audit_logs_entity_idx").on(t.entityType, t.entityId)],
);

// ---------------------------------------------------------------------------
// Editable event information (admin can update without redeploying)
// ---------------------------------------------------------------------------

export const weddingSettings = pgTable("wedding_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const guestsRelations = relations(guests, ({ one, many }) => ({
  group: one(invitationGroups, {
    fields: [guests.groupId],
    references: [invitationGroups.id],
  }),
  registration: one(registrations, {
    fields: [guests.id],
    references: [registrations.guestId],
  }),
  tickets: many(tickets),
  checkIn: one(checkIns, {
    fields: [guests.id],
    references: [checkIns.guestId],
  }),
}));

export const invitationGroupsRelations = relations(
  invitationGroups,
  ({ many }) => ({
    guests: many(guests),
  }),
);

export const registrationsRelations = relations(registrations, ({ one }) => ({
  guest: one(guests, {
    fields: [registrations.guestId],
    references: [guests.id],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
  guest: one(guests, { fields: [tickets.guestId], references: [guests.id] }),
  checkIn: one(checkIns, {
    fields: [tickets.id],
    references: [checkIns.ticketId],
  }),
}));

export const checkInsRelations = relations(checkIns, ({ one }) => ({
  ticket: one(tickets, {
    fields: [checkIns.ticketId],
    references: [tickets.id],
  }),
  guest: one(guests, { fields: [checkIns.guestId], references: [guests.id] }),
  officer: one(users, {
    fields: [checkIns.officerId],
    references: [users.id],
  }),
}));
