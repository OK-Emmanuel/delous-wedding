"use client";

import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { HelpCircleIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import FaqAccordion, { type FaqItem } from "./FaqAccordion";
import Reveal from "./Reveal";

export default function FaqSplitSection({ items }: { items: FaqItem[] }) {
  return (
    <section
      id="faqs"
      className="relative w-full min-h-screen lg:h-screen lg:min-h-[720px] overflow-hidden bg-ivory flex flex-col lg:flex-row"
    >
      {/* LEFT SIDE: FAQ Content & Accordion (50% on desktop) */}
      <div className="relative w-full lg:w-1/2 min-h-full flex flex-col justify-center px-6 py-14 sm:px-12 lg:px-16 overflow-y-auto z-10">
        <div className="max-w-xl mx-auto lg:mx-0 w-full">
          <Reveal>
            <div className="flex items-center gap-2 text-gold">
              <HugeiconsIcon icon={HelpCircleIcon} size={18} />
              <span className="text-xs uppercase tracking-[0.4em] font-semibold text-gold">
                GOOD TO KNOW &bull; FAQS
              </span>
            </div>

            <h2 className="mt-3 font-display text-4xl sm:text-5xl font-medium text-burgundy tracking-tight">
              Questions &amp; Answers
            </h2>

            <div className="ornament-divider mt-4 mb-6 max-w-xs text-xs text-gold">✦</div>

            <p className="text-sm sm:text-base leading-relaxed text-rich-black/75 mb-8">
              Everything you need to know about our special day, invitations, admission guidelines, and celebration arrangements.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            {/* The Accordion */}
            <div className="space-y-3">
              <FaqAccordion items={items} />
            </div>

            <div className="mt-8 pt-4 border-t border-gold/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <Link
                href="/faqs"
                className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-burgundy hover:text-gold transition"
              >
                <span>VIEW ALL QUESTIONS</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>

              <span className="text-xs text-rich-black/50 italic">
                Need more assistance? Reach our RSVP team below.
              </span>
            </div>
          </Reveal>
        </div>
      </div>

      {/* RIGHT SIDE: Wedding Photograph (50% on desktop) */}
      <div className="relative w-full lg:w-1/2 h-[380px] sm:h-[460px] lg:h-full overflow-hidden bg-wine order-first lg:order-last">
        <Image
          src="/court/_DSC0716.JPG"
          alt="Couple smiling with genuine joy at court registry"
          fill
          priority={false}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-center filter brightness-[0.95] contrast-[1.05] transition-transform duration-1000 hover:scale-105"
        />

        {/* Ambient Dark Gradient for Elegance and Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 lg:bg-gradient-to-l lg:from-transparent lg:via-black/20 lg:to-black/60" />

        {/* Top Tag Badge */}
        <div className="absolute top-6 right-6 z-10 hidden sm:flex items-center gap-2 rounded-full border border-gold/40 bg-wine/70 px-4 py-1.5 backdrop-blur-md">
          <HugeiconsIcon icon={SparklesIcon} size={14} className="text-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-champagne">
            WE ARE EXCITED TO HOST YOU
          </span>
        </div>

        {/* Bottom Quote Badge */}
        <div className="absolute bottom-6 left-6 right-6 z-10 text-champagne hidden sm:block">
          <div className="rounded-2xl border border-gold/30 bg-wine/70 p-5 backdrop-blur-md max-w-md">
            <p className="font-display text-lg sm:text-xl italic text-champagne">
              &ldquo;We cannot wait to celebrate this historic day of love, praise, and family fellowship with you.&rdquo;
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-gold font-semibold">
              Saturday, 28 November 2026 &bull; Lagos, Nigeria
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
