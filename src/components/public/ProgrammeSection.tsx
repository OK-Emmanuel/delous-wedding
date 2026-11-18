"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ChurchIcon,
  PartyPopperIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import Reveal from "./Reveal";
import ScratchCard from "./ScratchCard";

interface ProgrammeSectionProps {
  ceremonyTime: string;
  ceremonyVenue: string;
  ceremonyAddress: string;
  receptionVenue: string;
  receptionAddress: string;
}

export default function ProgrammeSection({
  ceremonyTime,
  ceremonyVenue,
  ceremonyAddress,
  receptionVenue,
  receptionAddress,
}: ProgrammeSectionProps) {
  const [revealAll, setRevealAll] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Smooth parallax scroll calculation
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Parallax translation range for the background image
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  // Google Calendar Links for both events
  const ceremonyCalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    "DELOUS '26 - Holy Matrimony"
  )}&dates=20261128T090000Z/20261128T120000Z&details=${encodeURIComponent(
    "Holy Matrimony service of Olasubulumi Adesola & Dare Samuel."
  )}&location=${encodeURIComponent(`${ceremonyVenue}, ${ceremonyAddress}`)}`;

  const receptionCalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    "DELOUS '26 - The Royal Reception"
  )}&dates=20261128T120000Z/20261128T170000Z&details=${encodeURIComponent(
    "Royal Reception celebration of Olasubulumi Adesola & Dare Samuel."
  )}&location=${encodeURIComponent(`${receptionVenue}, ${receptionAddress}`)}`;

  // Reliable Google Maps Direct Navigation Links
  const ceremonyMapLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${ceremonyVenue}, ${ceremonyAddress}`
  )}`;

  const receptionMapLink = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${receptionVenue}, ${receptionAddress}`
  )}`;

  return (
    <section
      ref={sectionRef}
      id="programme"
      className="relative overflow-hidden bg-burgundy px-5 py-24 sm:py-32 text-champagne min-h-screen flex items-center justify-center"
    >
      {/* Parallax Background Image Container */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 -top-28 -bottom-28 pointer-events-none z-0 overflow-hidden"
      >
        <Image
          src="/corporate/_NZ55121-Edit.jpg"
          alt="Couple portrait backdrop"
          fill
          priority={false}
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.25] contrast-[1.15]"
        />
      </motion.div>

      {/* Multi-layered luxury color gradient overlay ensuring maximum text readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#18050c]/92 via-[#2b0814]/94 to-[#18050c]/95" />
      <div className="absolute inset-0 z-0 bg-radial-at-c from-transparent via-[#260811]/60 to-[#140308]/90" />

      {/* Main Section Content */}
      <div className="relative z-10 mx-auto max-w-5xl w-full">
        <Reveal>
          <div className="mb-12 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-wine/80 px-5 py-1.5 text-[11px] uppercase tracking-[0.35em] text-gold backdrop-blur-md shadow-lg">
              <HugeiconsIcon icon={SparklesIcon} size={14} />
              <span>INTERACTIVE WEDDING ITINERARY</span>
              <HugeiconsIcon icon={SparklesIcon} size={14} />
            </span>

            <h2 className="mt-4 font-display text-4xl sm:text-5xl md:text-6xl font-medium text-champagne drop-shadow-md">
              One Day, Two Celebrations
            </h2>

            <div className="ornament-divider mx-auto mt-4 max-w-xs text-sm text-gold">✦</div>

            <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-champagne/80 leading-relaxed font-light">
              Scratch or swipe across each card to reveal the sacred ceremony and royal reception details.
            </p>

            {/* Quick Reveal All toggle */}
            <div className="mt-6 flex items-center justify-center">
              <button
                onClick={() => setRevealAll((prev) => !prev)}
                type="button"
                className="group inline-flex items-center gap-2 rounded-full border border-gold/50 bg-wine/90 px-6 py-2.5 text-xs font-semibold tracking-wider text-gold shadow-xl backdrop-blur hover:bg-gold hover:text-wine transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <HugeiconsIcon icon={SparklesIcon} size={14} className="text-gold group-hover:text-wine" />
                <span>{revealAll ? "↺ Reset Scratch Cards" : "Reveal All Programme Details"}</span>
              </button>
            </div>
          </div>
        </Reveal>

        {/* Scratch Cards Grid - Identical Height & Structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 py-4 sm:gap-8 items-stretch">
          <Reveal delay={0.1} className="h-full flex flex-col">
            <ScratchCard
              title="Holy Matrimony"
              subtitle="The Sacred Union"
              icon={<HugeiconsIcon icon={ChurchIcon} size={22} />}
              time={ceremonyTime}
              venue={ceremonyVenue}
              address={ceremonyAddress}
              highlights={[
                "Solemnisation & Sacred Vows",
                "Choir Hymns & Nuptial Blessing",
              ]}
              calendarLink={ceremonyCalLink}
              mapLink={ceremonyMapLink}
              isAllRevealed={revealAll}
            />
          </Reveal>

          <Reveal delay={0.2} className="h-full flex flex-col">
            <ScratchCard
              title="Royal Reception"
              subtitle="Celebration of Love"
              icon={<HugeiconsIcon icon={PartyPopperIcon} size={22} />}
              time="IMMEDIATELY AFTER"
              venue={receptionVenue}
              address={receptionAddress}
              highlights={[
                "Grand Couple Royal Entrance",
                "Celebratory Banquet & Dances",
              ]}
              calendarLink={receptionCalLink}
              mapLink={receptionMapLink}
              isAllRevealed={revealAll}
            />
          </Reveal>
        </div>

        {/* Note below */}
        <p className="mt-10 text-center text-xs tracking-wider text-champagne/60 font-light">
          We kindly request all guests to be seated at the church sanctuary 15 minutes prior to commencement.
        </p>
      </div>
    </section>
  );
}
