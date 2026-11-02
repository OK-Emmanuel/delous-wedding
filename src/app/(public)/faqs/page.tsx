import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { faqs } from "@/db/schema";
import FaqAccordion from "@/components/public/FaqAccordion";

export const revalidate = 300;

export const metadata = { title: "FAQs — DELOUS '26" };

export default async function FaqsPage() {
  const items = await db.query.faqs.findMany({
    where: eq(faqs.status, "published"),
    orderBy: [asc(faqs.sortOrder)],
  });

  return (
    <div className="bg-ivory pb-24 pt-32">
      <div className="mx-auto max-w-4xl px-5">
        <div className="mb-12 text-center">
          <p className="text-xs tracking-[0.4em] text-gold">GOOD TO KNOW</p>
          <h1 className="mt-3 font-display text-5xl font-medium text-burgundy">
            Questions &amp; Answers
          </h1>
          <div className="ornament-divider mx-auto mt-5 max-w-xs text-sm">✦</div>
        </div>
        <FaqAccordion items={items} />
      </div>
    </div>
  );
}
