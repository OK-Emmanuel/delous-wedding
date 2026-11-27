import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { weddingSettings } from "@/db/schema";
import { authorize, requirePermission } from "@/lib/auth/permissions";
import { audit } from "@/lib/audit";
import { getSettings } from "@/lib/settings";
import { SETTING_KEYS } from "@/lib/constants";
import { PageHeader, Card, btnPrimary, inputCls, labelCls } from "@/components/admin/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Settings01Icon,
  Calendar03Icon,
  Location01Icon,
  FloppyDiskIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requirePermission("change_settings");
  const settings = await getSettings();

  async function save(formData: FormData) {
    "use server";
    const session = await authorize("change_settings");
    for (const key of SETTING_KEYS) {
      const value =
        key === "registration_open"
          ? formData.get("registration_open") === "on"
            ? "true"
            : "false"
          : formData.get(key);
      if (value == null) continue;
      await db
        .insert(weddingSettings)
        .values({ key, value: String(value), updatedAt: new Date() })
        .onConflictDoUpdate({
          target: weddingSettings.key,
          set: { value: String(value), updatedAt: new Date() },
        });
    }
    await audit({
      userId: session.id,
      action: "settings.update",
      entityType: "settings",
    });
    revalidatePath("/", "page");
    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");
  }

  const isRegOpen = settings.registration_open === "true";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wedding Event Settings"
        description="Core configuration powering the public celebration website, countdown timers, venue directions, and RSVP controls."
      />

      <form action={save} className="max-w-4xl space-y-6">
        {/* Registration Toggle Card */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
                  Public Guest Registration Portal
                </h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isRegOpen
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isRegOpen ? "bg-emerald-500" : "bg-zinc-400"
                    }`}
                  />
                  <span>{isRegOpen ? "Active & Open" : "Closed"}</span>
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500 leading-relaxed max-w-xl">
                When enabled, visitors can submit registration requests through the website. Disabling closes the public form while retaining all existing registrations.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                name="registration_open"
                defaultChecked={isRegOpen}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-burgundy"></div>
            </label>
          </div>
        </Card>

        {/* Date, Schedule & Venue Configuration */}
        <Card
          title="Date & Venue Details"
          description="Controls the countdown timer and location cards rendered on the homepage."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls}>
                Event Date & Time (ISO 8601 with +01:00 offset) *
              </label>
              <input
                name="event_date"
                defaultValue={settings.event_date}
                className={inputCls}
                required
              />
              <p className="mt-1 text-[11px] text-zinc-400">
                Powers the live countdown timer, e.g. <code>2026-11-28T10:00:00+01:00</code>
              </p>
            </div>

            <div>
              <label className={labelCls}>Ceremony Time (Display Text)</label>
              <input
                name="ceremony_time"
                defaultValue={settings.ceremony_time}
                placeholder="10:00 AM Prompt"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Ceremony Venue Name</label>
              <input
                name="ceremony_venue"
                defaultValue={settings.ceremony_venue}
                placeholder="Church / Cathedral"
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Ceremony Address</label>
              <input
                name="ceremony_address"
                defaultValue={settings.ceremony_address}
                placeholder="Full street address and city"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Reception Venue Name</label>
              <input
                name="reception_venue"
                defaultValue={settings.reception_venue}
                placeholder="Grand Ballroom / Event Centre"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Colour of the Day / Dress Code</label>
              <input
                name="dress_code"
                defaultValue={settings.dress_code}
                placeholder="Burgundy, Wine & Champagne Gold"
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Reception Address</label>
              <input
                name="reception_address"
                defaultValue={settings.reception_address}
                placeholder="Full reception address"
                className={inputCls}
              />
            </div>
          </div>
        </Card>

        {/* Contacts & Narrative Details */}
        <Card
          title="RSVP Contacts & Narrative"
          description="Helpline contacts and love story shown on the wedding invitation portal."
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Primary RSVP Contact</label>
              <input
                name="rsvp_contact_1"
                defaultValue={settings.rsvp_contact_1}
                placeholder="e.g. Olasubulumi Adesola (+234...)"
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Secondary RSVP Contact</label>
              <input
                name="rsvp_contact_2"
                defaultValue={settings.rsvp_contact_2}
                placeholder="e.g. Dare Samuel (+234...)"
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Hero Tagline</label>
              <input
                name="hero_tagline"
                defaultValue={settings.hero_tagline}
                placeholder="A royal celebration of love, culture and legacy."
                className={inputCls}
              />
            </div>

            <div className="sm:col-span-2">
              <label className={labelCls}>Our Story</label>
              <textarea
                name="our_story"
                rows={5}
                defaultValue={settings.our_story}
                placeholder="The narrative of how Olasubulumi & Dare met..."
                className={inputCls}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-zinc-100 mt-6">
            <button type="submit" className={btnPrimary}>
              <HugeiconsIcon icon={FloppyDiskIcon} size={15} />
              <span>Save & Publish Live Settings</span>
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
}
