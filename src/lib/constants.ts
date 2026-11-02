export const EVENT = {
  tag: "DELOUS '26",
  couple: "Olasubulumi Adesola & Dare Samuel",
  brideFirst: "Olasubulumi",
  groomFirst: "Dare",
  // Saturday 28 November 2026, 10:00 WAT (UTC+1)
  dateISO: "2026-11-28T10:00:00+01:00",
  dateLabel: "Saturday, 28 November 2026",
  timeLabel: "10:00 AM WAT",
} as const;

export const SETTING_KEYS = [
  "event_date",
  "ceremony_time",
  "ceremony_venue",
  "ceremony_address",
  "reception_venue",
  "reception_address",
  "dress_code",
  "rsvp_contact_1",
  "rsvp_contact_2",
  "hero_tagline",
  "our_story",
  "registration_open",
] as const;

export type SettingKey = (typeof SETTING_KEYS)[number];

export const DEFAULT_SETTINGS: Record<SettingKey, string> = {
  event_date: "2026-11-28T10:00:00+01:00",
  ceremony_time: "10:00 AM WAT",
  ceremony_venue: "Araromi Baptist Church",
  ceremony_address: "42, Shokunbi Street, Mushin, Lagos State",
  reception_venue: "ECWA Event Hall",
  reception_address: "Challenge, Mushin, Lagos State",
  dress_code: "White & Ofi",
  rsvp_contact_1: "Daniel: 09036902177",
  rsvp_contact_2: "Peluola: 09020602232",
  hero_tagline: "A royal celebration of love, culture and legacy.",
  our_story:
    "Ìfẹ́ ni gbogbo rẹ̀ — love is everything. What began as a simple hello grew into a friendship, and that friendship blossomed into a love story written across two families. Olasubulumi and Dare found in each other a shared faith, a shared laughter and a shared dream of legacy. On the 28th of November 2026, surrounded by family and friends, they will stand before God and say: forever.",
  registration_open: "true",
};

export const RELATIONSHIP_OPTIONS = [
  { value: "brides_family", label: "Bride's family" },
  { value: "grooms_family", label: "Groom's family" },
  { value: "brides_friend", label: "Bride's friend" },
  { value: "grooms_friend", label: "Groom's friend" },
  { value: "family_friend", label: "Family friend" },
  { value: "colleague", label: "Colleague" },
  { value: "church_member", label: "Church member" },
  { value: "other", label: "Other" },
] as const;

export const ATTENDANCE_OPTIONS = [
  { value: "definitely", label: "Definitely attending" },
  { value: "likely", label: "Most likely attending" },
  { value: "unsure", label: "Not sure yet" },
  { value: "declined", label: "Unable to attend" },
] as const;

export const RELATIONSHIP_LABELS: Record<string, string> =
  Object.fromEntries(RELATIONSHIP_OPTIONS.map((o) => [o.value, o.label]));

export const ATTENDANCE_LABELS: Record<string, string> = Object.fromEntries(
  ATTENDANCE_OPTIONS.map((o) => [o.value, o.label]),
);

export const GUEST_STATUS_LABELS: Record<string, string> = {
  preloaded: "Preloaded",
  registered: "Registered",
  confirmed: "Confirmed",
  revoked: "Revoked",
};

export const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Wedding Admin",
  checkin_officer: "Check-in Officer",
  content_manager: "Content Manager",
};

export const ADMISSION_NOTICE =
  "This invitation is strictly for one registered person. Bringing unregistered participants is not permitted. Every attendee must register individually and receive their own digital invitation.";

export function attendeeCodeFromId(id: number): string {
  return `DELOUS-26-${String(id).padStart(6, "0")}`;
}

export function normalizePhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  // Normalise Nigerian numbers: 0803... -> 234803...
  if (digits.startsWith("0") && digits.length === 11) {
    digits = "234" + digits.slice(1);
  }
  return digits;
}
