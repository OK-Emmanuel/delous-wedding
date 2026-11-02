import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./index";
import { faqs, invitationGroups, users, weddingSettings } from "./schema";
import { DEFAULT_SETTINGS } from "@/lib/constants";

async function seed() {
  // --- Super admin -----------------------------------------------------
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@delous26.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Delous26!Royal";
  await db
    .insert(users)
    .values({
      name: "Super Admin",
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "super_admin",
    })
    .onConflictDoNothing({ target: users.email });
  console.log(`Super admin: ${adminEmail} / ${adminPassword}`);

  // --- Initial invitation groups (PRD §8.3) ----------------------------
  const groups = [
    "Bride's Family",
    "Groom's Family",
    "Bride's Friends",
    "Groom's Friends",
    "Family Friends",
    "Church Community",
    "Special Guests",
  ];
  for (const name of groups) {
    await db
      .insert(invitationGroups)
      .values({ name })
      .onConflictDoNothing({ target: invitationGroups.name });
  }
  console.log(`Groups seeded: ${groups.length}`);

  // --- Wedding settings -------------------------------------------------
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db
      .insert(weddingSettings)
      .values({ key, value })
      .onConflictDoNothing({ target: weddingSettings.key });
  }
  console.log("Wedding settings seeded");

  // --- Starter FAQs -----------------------------------------------------
  const starterFaqs: Array<[string, string]> = [
    [
      "Can I bring a plus one?",
      "Every invitation admits one registered person only. Anyone who wishes to attend must register individually and receive their own digital invitation and QR ticket.",
    ],
    [
      "What is the dress code?",
      "The colour of the day is White & Ofi. Traditional attire is warmly encouraged — come dressed for a royal Yoruba celebration.",
    ],
    [
      "What time should I arrive?",
      "The wedding ceremony starts at 10:00 AM WAT at Araromi Baptist Church, Mushin. We recommend arriving at least 30 minutes early for check-in.",
    ],
    [
      "I lost my invitation email. What do I do?",
      "Visit the invitation page on this website and use the \"Retrieve my invitation\" option. A one-time verification code will be sent to your registered email.",
    ],
    [
      "Do I need to print my QR ticket?",
      "No — presenting the QR code on your phone at the entrance is perfect. You may print it if you prefer.",
    ],
  ];
  const existing = await db.select({ id: faqs.id }).from(faqs).limit(1);
  if (existing.length === 0) {
    await db.insert(faqs).values(
      starterFaqs.map(([question, answer], i) => ({
        question,
        answer,
        sortOrder: i,
        status: "published" as const,
      })),
    );
    console.log(`FAQs seeded: ${starterFaqs.length}`);
  }

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
