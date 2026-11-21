import "dotenv/config";
import { Pool } from "pg";
import { DEFAULT_SETTINGS } from "@/lib/constants";

// One-off: sync wedding_settings.our_story with the new text in constants.ts
async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const before = await pool.query(
    "SELECT value FROM wedding_settings WHERE key = 'our_story'",
  );
  const current: string | undefined = before.rows[0]?.value;
  console.log("--- BEFORE (db) ---");
  console.log(current ?? "(no row — site falls back to constants.ts)");
  console.log("contains 2022:", current?.includes("2022") ?? false);

  const next = DEFAULT_SETTINGS.our_story;
  await pool.query(
    `INSERT INTO wedding_settings (key, value, updated_at)
     VALUES ('our_story', $1, now())
     ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = now()`,
    [next],
  );

  const after = await pool.query(
    "SELECT value, updated_at FROM wedding_settings WHERE key = 'our_story'",
  );
  console.log("--- AFTER (db) ---");
  console.log("contains 2021:", after.rows[0].value.includes("2021"));
  console.log("contains 2022:", after.rows[0].value.includes("2022"));
  console.log("updated_at:", after.rows[0].updated_at);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
