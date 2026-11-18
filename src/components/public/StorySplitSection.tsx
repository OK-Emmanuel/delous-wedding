"use client";

import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FavouriteIcon,
  QuoteUpIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import Reveal from "./Reveal";

interface StorySplitSectionProps {
  story?: string;
}

export default function StorySplitSection({ story }: StorySplitSectionProps) {
  const storyText =
    story?.trim() ||
    "Every beautiful love story has a beginning, and ours began in JSS1, when we first met as classmates in secondary school. What started as a simple friendship blossomed into something truly special in SS1, laying the foundation for a love that would stand the test of time.\n\nYears later, in 2022, while I was in my 100 level at the university, I took a leap of faith and asked her to be mine. It was a beautiful moment made even more special by the fact that we were studying at the same university.\n\nFrom childhood classmates to university sweethearts, our journey has been nothing short of amazing. Through every season, we have grown together, loved deeply, and witnessed God's unwavering faithfulness.\n\nNow, you are joining us to celebrate not just how far we have come, but the beautiful forever that awaits us. What began as friendship has blossomed into a lifetime of love, and we couldn't be more grateful for the gift of finding each other.\n\n– G Sam";

  return (
    <section
      id="story"
      className="relative w-full min-h-screen lg:h-screen lg:min-h-[700px] overflow-hidden bg-ivory flex flex-col lg:flex-row"
    >
      {/* LEFT SIDE: Couple's Portrait & Romance Visual (50% on desktop) */}
      <div className="relative w-full lg:w-1/2 h-[380px] sm:h-[460px] lg:h-full overflow-hidden bg-wine">
        <Image
          src="/corporate/_NZ55161-Edit.jpg"
          alt="Olasubulumi and Dare in romantic celebration"
          fill
          priority={false}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-[center_20%] filter brightness-[0.94] contrast-[1.04] transition-transform duration-1000 hover:scale-105"
        />

        {/* Ambient Dark Gradient Vignette for Depth & Elegance */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#120207]/90 via-black/25 to-black/35 lg:bg-gradient-to-r lg:from-transparent lg:via-black/20 lg:to-[#120207]/80" />

        {/* Top Floating Badge */}
        <div className="absolute top-6 left-6 z-10 hidden sm:flex items-center gap-2 rounded-full border border-gold/40 bg-wine/70 px-4 py-1.5 backdrop-blur-md">
          <HugeiconsIcon icon={FavouriteIcon} size={14} className="text-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-champagne">
            DELOUS &rsquo;26 &bull; OUR LOVE JOURNEY
          </span>
        </div>

        {/* Bottom Romantic Quote Card */}
        <div className="absolute bottom-6 left-6 right-6 z-10 hidden sm:block">
          <div className="rounded-2xl border border-gold/30 bg-wine/75 p-5 backdrop-blur-md max-w-md shadow-2xl">
            <div className="flex items-center gap-2 text-gold mb-1.5">
              <HugeiconsIcon icon={SparklesIcon} size={14} />
              <span className="text-[10px] uppercase tracking-[0.25em] font-semibold text-champagne/90">
                PROMISE OF ETERNITY
              </span>
            </div>
            <p className="font-display text-lg sm:text-xl italic text-champagne leading-snug">
              &ldquo;From secondary school classrooms in JSS1 to this royal altar of marriage &mdash; God has truly been faithful.&rdquo;
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-gold font-semibold">
              Olasubulumi Adesola &amp; Dare Samuel
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: The Story Content (No vertical scroll, clean & legible) */}
      <div className="relative w-full lg:w-1/2 min-h-full flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16 bg-gradient-to-br from-ivory via-[#fdfbf7] to-champagne/25 shadow-2xl z-10">
        {/* Subtle Ambient Decorative Glow */}
        <div className="pointer-events-none absolute -right-20 top-1/4 h-80 w-80 rounded-full bg-gold/10 blur-[100px]" />

        <div className="relative z-10 max-w-xl mx-auto lg:mx-0 w-full space-y-5">
          <Reveal>
            <div className="flex items-center gap-2 text-gold">
              <HugeiconsIcon icon={FavouriteIcon} size={18} />
              <span className="text-xs uppercase tracking-[0.4em] font-semibold text-gold">
                ÌFẸ́ NI GBOGBO RẸ̀ &bull; LOVE IS EVERYTHING
              </span>
            </div>

            <h2 className="mt-2 font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-burgundy tracking-tight">
              Our Story
            </h2>

            <div className="ornament-divider mt-2.5 mb-4 max-w-xs text-xs text-gold">✦</div>
          </Reveal>

          {/* Story Parchment Card - Flat & naturally fitted, NO scrollbars */}
          <Reveal delay={0.15}>
            <div className="relative rounded-3xl border border-gold/30 bg-white/90 p-6 sm:p-8 shadow-xl shadow-gold/5 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 mb-3.5 text-gold border-b border-gold/15 pb-2.5">
                <HugeiconsIcon icon={QuoteUpIcon} size={18} className="text-gold" />
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.25em] text-rich-black/60">
                  A Friendship Crowned in Glory
                </span>
              </div>
              <div className="relative z-10 space-y-3.5 text-rich-black/85 font-light text-sm sm:text-[15px] lg:text-[15px] xl:text-base leading-relaxed whitespace-pre-line">
                {storyText}
              </div>
            </div>
          </Reveal>

          {/* Sign-off Footnote */}
          <Reveal delay={0.25}>
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-rich-black/60 border-t border-gold/20">
              <span className="italic font-serif">
                &ldquo;What began as friendship has blossomed into a lifetime of love.&rdquo;
              </span>
              <span className="font-semibold text-burgundy uppercase tracking-widest text-[10px]">
                &ndash; G Sam &amp; Subulumi
              </span>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
