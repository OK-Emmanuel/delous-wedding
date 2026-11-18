import Link from "next/link";
import Image from "next/image";
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

      {/* 3. Our Story Section with Romantic Photography & Timeline */}
      <section id="story" className="relative overflow-hidden bg-ivory px-5 py-28 sm:py-36">
        <div className="pointer-events-none absolute -right-32 top-10 h-96 w-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-10 h-96 w-96 rounded-full bg-burgundy/5 blur-3xl" />

        <div className="relative mx-auto max-w-5xl">
          <Reveal>
            <SectionHeading
              kicker="ÌFẸ́ NI GBOGBO RẸ̀ &bull; LOVE IS EVERYTHING"
              title="Our Story"
              subtitle="From secondary school classrooms in JSS1 to this royal altar of marriage — God has truly been faithful."
            />
          </Reveal>

          {/* Editorial Story Layout */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
            {/* Romantic Portrait Card */}
            <div className="md:col-span-5 relative">
              <Reveal delay={0.1}>
                <div className="group relative mx-auto max-w-sm overflow-hidden rounded-3xl border-2 border-gold/40 shadow-2xl shadow-burgundy/20">
                  <div className="aspect-[4/5] relative w-full overflow-hidden bg-wine">
                    <Image
                      src="/corporate/_NZ55161-Edit.jpg"
                      alt="Olasubulumi and Dare in romantic celebration"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-wine/80 via-transparent to-transparent" />
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-6 text-champagne text-center">
                    <p className="font-display text-xl italic font-semibold">
                      Olasubulumi &amp; Dare
                    </p>
                    <p className="text-[11px] tracking-widest text-gold uppercase mt-1">
                      Childhood Friends to Lifelong Companions
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Story Text & Milestone Moments */}
            <div className="md:col-span-7 space-y-6">
              <Reveal delay={0.2}>
                <div className="relative rounded-3xl border border-gold/30 bg-white/80 p-8 sm:p-10 shadow-lg shadow-gold/5 backdrop-blur-sm">
                  <span className="font-serif text-5xl text-gold/30 absolute top-4 left-5 leading-none select-none">
                    &ldquo;
                  </span>
                  <div className="relative z-10 space-y-5 text-rich-black/80 font-light text-base sm:text-lg leading-relaxed whitespace-pre-line">
                    {settings.our_story}
                  </div>
                </div>
              </Reveal>

              {/* Journey Milestones */}
              <Reveal delay={0.3}>
                <div className="grid grid-cols-3 gap-3 sm:gap-4 text-center">
                  <div className="rounded-2xl border border-gold/30 bg-champagne/30 p-4">
                    <p className="font-display text-2xl sm:text-3xl font-bold text-burgundy">
                      JSS 1
                    </p>
                    <p className="mt-1 text-[11px] sm:text-xs text-rich-black/60 uppercase tracking-wider">
                      First Met
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gold/30 bg-champagne/30 p-4">
                    <p className="font-display text-2xl sm:text-3xl font-bold text-burgundy">
                      2022
                    </p>
                    <p className="mt-1 text-[11px] sm:text-xs text-rich-black/60 uppercase tracking-wider">
                      Love Rekindled
                    </p>
                  </div>
                  <div className="rounded-2xl border border-gold/30 bg-champagne/30 p-4">
                    <p className="font-display text-2xl sm:text-3xl font-bold text-gold">
                      Forever
                    </p>
                    <p className="mt-1 text-[11px] sm:text-xs text-rich-black/60 uppercase tracking-wider">
                      DELOUS &rsquo;26
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

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
