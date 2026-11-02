import { db } from "@/db";
import { weddingSettings } from "@/db/schema";
import { DEFAULT_SETTINGS, type SettingKey } from "@/lib/constants";

export type Settings = Record<SettingKey, string>;

/** Load editable event information, falling back to PRD defaults. */
export async function getSettings(): Promise<Settings> {
  const merged: Settings = { ...DEFAULT_SETTINGS };
  try {
    const rows = await db.select().from(weddingSettings);
    for (const row of rows) {
      if (row.key in merged) merged[row.key as SettingKey] = row.value;
    }
  } catch (err) {
    console.error("settings load failed, using defaults", err);
  }
  return merged;
}
