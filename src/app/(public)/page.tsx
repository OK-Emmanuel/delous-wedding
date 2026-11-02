import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { faqs, gallery } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import Intro from "@/components/public/Intro";
import Hero from "@/components/public/Hero";
import Reveal from "@/components/public/Reveal";
import FaqAccordion from "@/components/public/FaqAccordion";
import GalleryGrid from "@/components/public/GalleryGrid";
import { ADMISSION_NOTICE } from "@/lib/constants";

export const revalidate = 300;

function SectionHeading({
  kicker,
  title,
}: {
  kicker: string;
  title: string;
}) {
  return (
    <div className="mb-10 text-center">
      <p className="text-xs tracking-[0.4em] text-gold">{kicker}</p>
      <h2 className="mt-3 font-display text-4xl font-medium text-burgundy md:text-5xl">
        {title}
      </h2>
      <div className="ornament-divider mx-auto mt-5 max-w-xs text-sm">✦</div>
    </div>
  );
}

export default async function HomePage() {
  const settings = await getSettings();
  const [publishedFaqs, publishedImages] = await Promise.all([
    db.query.faqs.findMany({
      where: eq(faqs.status, "published"),
      orderBy: [asc(faqs.sortOrder)],
      limit: 6,
    }),
    db.query.gallery.findMany({
      where: eq(gallery.status, "published"),
      orderBy: [asc(gallery.sortOrder)],
      limit: 8,
    }),
  ]);

  return (
    <>
      <Intro />
      <Hero tagline={settings.hero_tagline} dateISO={settings.event_date} />

      {/* Our story */}
      <section id="story" className="bg-ivory px-5 py-24">
        <Reveal>
          <SectionHeading kicker="ÌFẸ́ NI GBOGBO RẸ̀" title="Our Story" />
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mx-auto max-w-2xl text-center font-display text-xl leading-relaxed text-rich-black/80 md:text-2xl">
            {settings.our_story}
          </p>
        </Reveal>
      </section>

      {/* Programme */}
      <section id="programme" className="bg-burgundy px-5 py-24 text-champagne">
        <Reveal>
          <div className="mb-10 text-center">
            <p className="text-xs tracking-[0.4em] text-gold">THE WEDDING PROGRAMME</p>
            <h2 className="mt-3 font-display text-4xl font-medium md:text-5xl">
              One Day, Two Celebrations
            </h2>
          </div>
        </Reveal>
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          <Reveal delay={0.1}>
            <div className="h-full rounded-2xl border border-gold/30 bg-wine/50 p-8 text-center">
              <p className="text-3xl">⛪</p>
              <h3 className="mt-4 font-display text-2xl text-gold">Wedding Ceremony</h3>
              <p className="mt-3 text-sm tracking-widest text-champagne/70">
                {settings.ceremony_time}
              </p>
              <p className="mt-4 font-display text-xl">{settings.ceremony_venue}</p>
              <p className="mt-1 text-sm text-champagne/70">{settings.ceremony_address}</p>
            </div>
          </Reveal>
          <Reveal delay={0.25}>
            <div className="h-full rounded-2xl border border-gold/30 bg-wine/50 p-8 text-center">
              <p className="text-3xl">🥂</p>
              <h3 className="mt-4 font-display text-2xl text-gold">Reception</h3>
              <p className="mt-3 text-sm tracking-widest text-champagne/70">
                IMMEDIATELY AFTER
              </p>
              <p className="mt-4 font-display text-xl">{settings.reception_venue}</p>
              <p className="mt-1 text-sm text-champagne/70">{settings.reception_address}</p>
            </div>
          </Reveal>
        </div>

        {/* Dress code */}
        <Reveal delay={0.2}>
          <div className="mx-auto mt-14 max-w-2xl rounded-2xl border border-gold/40 bg-gradient-to-br from-wine to-burgundy p-10 text-center">
            <p className="text-xs tracking-[0.4em] text-gold">COLOUR OF THE DAY</p>
            <p className="gold-text mt-4 font-display text-4xl font-semibold md:text-5xl">
              White &amp; Ofi
            </p>
            <p className="mt-4 text-sm text-champagne/70">
              {settings.dress_code !== "White & Ofi" ? settings.dress_code : null}
              Come dressed for a royal Yoruba celebration — traditional attire
              is warmly encouraged.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Registration invitation */}
      <section className="bg-ivory px-5 py-24">
        <Reveal>
          <div className="mx-auto max-w-3xl rounded-3xl border border-gold/30 bg-white p-10 text-center shadow-xl shadow-gold/5 md:p-14">
            <p className="font-display text-2xl italic text-gold">Ẹ káàbọ̀!</p>
            <h2 className="mt-3 font-display text-4xl font-medium text-burgundy md:text-5xl">
              Will you celebrate with us?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-rich-black/70">
              Registration is open to everyone. Each registration creates your
              personal digital invitation with a unique QR admission ticket.
            </p>
            <p className="mx-auto mt-4 max-w-xl rounded-lg bg-champagne/50 p-3 text-xs text-burgundy/80">
              {ADMISSION_NOTICE}
            </p>
            <Link
              href="/register"
              className="mt-8 inline-block rounded-full bg-burgundy px-12 py-4 font-medium tracking-wide text-champagne shadow-lg transition hover:scale-105 hover:bg-wine"
            >
              Register Now — It&rsquo;s Free
            </Link>
          </div>
        </Reveal>
      </section>

      {/* Gallery preview */}
      <section className="bg-champagne/40 px-5 py-24">
        <Reveal>
          <SectionHeading kicker="PRE-WEDDING" title="Gallery" />
        </Reveal>
        <div className="mx-auto max-w-5xl">
          <Reveal delay={0.1}>
            <GalleryGrid images={publishedImages} />
            {publishedImages.length > 0 && (
              <div className="mt-8 text-center">
                <Link
                  href="/gallery"
                  className="text-sm tracking-widest text-burgundy underline-offset-4 hover:underline"
                >
                  VIEW FULL GALLERY →
                </Link>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* FAQs */}
      <section className="bg-ivory px-5 py-24">
        <Reveal>
          <SectionHeading kicker="GOOD TO KNOW" title="Questions & Answers" />
        </Reveal>
        <Reveal delay={0.1}>
          <FaqAccordion items={publishedFaqs} />
          <div className="mt-8 text-center">
            <Link
              href="/faqs"
              className="text-sm tracking-widest text-burgundy underline-offset-4 hover:underline"
            >
              ALL QUESTIONS →
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
