import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { faqs, gallery } from "@/db/schema";
import { getSettings } from "@/lib/settings";
import Intro from "@/components/public/Intro";
import Hero from "@/components/public/Hero";
import Reveal from "@/components/public/Reveal";
import GalleryGrid from "@/components/public/GalleryGrid";
import ProgrammeSection from "@/components/public/ProgrammeSection";
import ColourOfTheDay from "@/components/public/ColourOfTheDay";
import GiftingSection from "@/components/public/GiftingSection";
import FaqSplitSection from "@/components/public/FaqSplitSection";
import StorySplitSection from "@/components/public/StorySplitSection";
import { getMergedGallery } from "@/lib/gallery-sources";
import { ADMISSION_NOTICE } from "@/lib/constants";

export const revalidate = 60;

function SectionHeading({
  kicker,
  title,
  subtitle,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-12 text-center">
      <p className="text-xs uppercase tracking-[0.45em] text-gold">{kicker}</p>
      <h2 className="mt-3 font-display text-4xl sm:text-5xl md:text-6xl font-medium text-burgundy">
        {title}
      </h2>
      <div className="ornament-divider mx-auto mt-5 max-w-xs text-sm text-gold">✦</div>
      {subtitle && (
        <p className="mx-auto mt-4 max-w-2xl text-rich-black/75 text-sm sm:text-base leading-relaxed">
          {subtitle}
        </p>
      )}
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
      limit: 12,
    }),
  ]);

  // Merge public folder images and admin uploaded images dynamically
  const mergedGallery = getMergedGallery(publishedImages);

  return (
    <>
      {/* 1. Welcome Intro - Persistent on every reload until skipped */}
      <Intro />

      {/* 2. Hero Section with Dynamic Background Carousel */}
      <Hero tagline={settings.hero_tagline} dateISO={settings.event_date} />

      {/* 3. Our Story Section - Full-Viewport Split Screen */}
      <StorySplitSection story={settings.our_story} />

      {/* 4. Programme Section - Parallax Background & Scratch-to-Reveal */}
      <ProgrammeSection
        ceremonyTime={settings.ceremony_time}
        ceremonyVenue={settings.ceremony_venue}
        ceremonyAddress={settings.ceremony_address}
        receptionVenue={settings.reception_venue}
        receptionAddress={settings.reception_address}
      />

      {/* 5. Colour of the Day - Standalone Editorial Visual Feature */}
      <ColourOfTheDay customDressCode={settings.dress_code} />

      {/* 6. Gifting & Donations Section - Full-Viewport Split Screen */}
      <GiftingSection />

      {/* 7. Registration Invitation Section */}
      <section className="relative overflow-hidden bg-ivory px-5 py-24 sm:py-32">
        <Reveal>
          <div className="relative mx-auto max-w-4xl rounded-3xl border border-gold/30 bg-gradient-to-br from-white via-[#fcfaf5] to-champagne/30 p-8 text-center shadow-xl shadow-gold/10 sm:p-14 md:p-16">
            <div className="pointer-events-none absolute -right-16 -top-16 font-serif text-8xl text-gold/10 select-none">
              ❖
            </div>
            <p className="font-display text-3xl italic text-gold">Ẹ káàbọ̀!</p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl md:text-6xl font-medium text-burgundy">
              Will you celebrate with us?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-rich-black/75">
              Registration is open to everyone. Each registration generates your
              personalized digital invitation card complete with a unique, secure QR admission code.
            </p>
            <div className="mx-auto mt-6 max-w-xl rounded-2xl border border-gold/30 bg-champagne/40 p-4 text-xs text-burgundy/90 leading-relaxed">
              <span className="font-bold uppercase tracking-wider block mb-1">Admission Notice</span>
              {ADMISSION_NOTICE}
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="group flex items-center gap-2 rounded-full bg-burgundy px-12 py-4 font-semibold tracking-wide text-champagne shadow-xl shadow-burgundy/25 transition-all duration-300 hover:scale-105 hover:bg-wine"
              >
                <span>REGISTER NOW &mdash; IT&rsquo;S FREE</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/invitation"
                className="rounded-full border border-burgundy/30 px-8 py-4 text-sm font-medium tracking-wide text-burgundy transition hover:border-burgundy hover:bg-burgundy/5"
              >
                Already Registered? Retrieve Ticket
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* 8. Dynamic Gallery Preview (Public folder + Admin uploaded images) */}
      <section id="gallery" className="relative overflow-hidden bg-champagne/30 px-5 py-28 sm:py-36">
        <Reveal>
          <SectionHeading
            kicker="PRE-WEDDING MOMENTS"
            title="Our Gallery"
            subtitle="Glimpses of love, laughter, and promises captured across our court registry, corporate, and intimate sessions."
          />
        </Reveal>
        <div className="mx-auto max-w-6xl">
          <Reveal delay={0.1}>
            <GalleryGrid images={mergedGallery} />
            <div className="mt-12 text-center">
              <Link
                href="/gallery"
                className="group inline-flex items-center gap-2 rounded-full border border-gold bg-wine px-8 py-3.5 text-xs font-semibold tracking-[0.25em] uppercase text-champagne shadow-lg transition-all duration-300 hover:scale-105 hover:bg-burgundy"
              >
                <span>EXPLORE COMPLETE GALLERY</span>
                <span className="text-gold transition-transform duration-300 group-hover:translate-x-1">→</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 9. FAQs Section - Full-Viewport Split Screen (Swapped Layout) */}
      <FaqSplitSection items={publishedFaqs} />
    </>
  );
}
