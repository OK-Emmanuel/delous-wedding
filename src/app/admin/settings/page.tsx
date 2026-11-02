import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { weddingSettings } from "@/db/schema";
import { authorize, requirePermission } from "@/lib/auth/permissions";
import { audit } from "@/lib/audit";
import { getSettings } from "@/lib/settings";
import { SETTING_KEYS, type SettingKey } from "@/lib/constants";
import { PageHeader, btnPrimary, inputCls, labelCls } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

const FIELDS: Array<{
  key: SettingKey;
  label: string;
  type?: "text" | "textarea";
  hint?: string;
}> = [
  { key: "event_date", label: "Event date & time (ISO with +01:00 offset)", hint: "Drives the public countdown, e.g. 2026-11-28T10:00:00+01:00" },
  { key: "ceremony_time", label: "Ceremony time (display text)" },
  { key: "ceremony_venue", label: "Ceremony venue" },
  { key: "ceremony_address", label: "Ceremony address" },
  { key: "reception_venue", label: "Reception venue" },
  { key: "reception_address", label: "Reception address" },
  { key: "dress_code", label: "Colour of the day / dress code" },
  { key: "rsvp_contact_1", label: "RSVP contact 1" },
  { key: "rsvp_contact_2", label: "RSVP contact 2" },
  { key: "hero_tagline", label: "Hero tagline" },
  { key: "our_story", label: "Our story", type: "textarea" },
];

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
    revalidatePath("/");
    revalidatePath("/admin/settings");
  }

  return (
    <>
      <PageHeader
        title="Settings"
        description="Event information shown across the website — changes go live without redeploying."
      />
      <form action={save} className="max-w-3xl space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-800">
          <input
            type="checkbox"
            name="registration_open"
            defaultChecked={settings.registration_open === "true"}
            className="h-4 w-4 accent-[#541323]"
          />
          Public registration is open
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key} className={f.type === "textarea" ? "md:col-span-2" : undefined}>
              <label className={labelCls}>{f.label}</label>
              {f.type === "textarea" ? (
                <textarea name={f.key} rows={4} defaultValue={settings[f.key]} className={inputCls} />
              ) : (
                <input name={f.key} defaultValue={settings[f.key]} className={inputCls} />
              )}
              {f.hint && <p className="mt-1 text-xs text-slate-400">{f.hint}</p>}
            </div>
          ))}
        </div>
        <button className={btnPrimary}>Save Settings</button>
      </form>
    </>
  );
}
