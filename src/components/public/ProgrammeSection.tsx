"use client";

import { useState } from "react";
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

  // Google Calendar Link generator for the ceremony
  const googleCalLink =
    "https://calendar.google.com/calendar/render?action=TEMPLATE&text=DELOUS+'26+-+Adesola+%26+Samuel+Wedding&dates=20261128T090000Z/20261128T180000Z&details=The+royal+wedding+celebration+of+Olasubulumi+Adesola+%26+Dare+Samuel.+One+day,+two+unforgettable+celebrations.&location=Araromi+Baptist+Church,+42+Shokunbi+Street,+Mushin,+Lagos";

  const ceremonyMapLink = "https://maps.app.goo.gl/kA1wNBgUDP85wPKz8";

  const receptionMapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${receptionVenue}, ${receptionAddress}`
  )}`;

  return (
    <section id="programme" className="relative overflow-hidden bg-burgundy px-5 py-24 sm:py-28 text-champagne">
      {/* Subtle ambient lighting */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-96 w-full max-w-4xl bg-gold/10 blur-[100px]" />

      <div className="relative mx-auto max-w-5xl">
        <Reveal>
          <div className="mb-12 text-center">
       
            <h2 className="mt-4 font-display text-4xl font-medium sm:text-5xl md:text-6xl text-champagne">
              One Day, Two Celebrations
            </h2>
            <div className="ornament-divider mx-auto mt-5 max-w-xs text-sm">✦</div>
            <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-champagne/75 leading-relaxed">
              Scratch or swipe across each card below to unveil the sacred ceremony and royal reception details.
            </p>

            {/* Quick Reveal All toggle */}
            <div className="mt-6 flex items-center justify-center">
              <button
                onClick={() => setRevealAll((prev) => !prev)}
                type="button"
                className="group inline-flex items-center gap-2 rounded-full border border-gold/40 bg-wine/80 px-6 py-2.5 text-xs font-semibold tracking-wider text-gold shadow-md backdrop-blur hover:bg-gold hover:text-wine transition-all duration-300"
              >
                <span>{revealAll ? "↺ Reset Cards" : "✦ Reveal All Programme Details"}</span>
              </button>
            </div>
          </div>
        </Reveal>

        {/* Scratch Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          <Reveal delay={0.1}>
            <ScratchCard
              title="Holy Matrimony"
              subtitle="The Sacred Union"
              icon="⛪"
              time={ceremonyTime}
              venue={ceremonyVenue}
              address={ceremonyAddress}
              highlights={[
                "Solemnisation of Holy Matrimony",
                "Exchange of Sacred Vows & Rings",
                "Choir Ministration & Hymns",
                "Parental Blessings & Prayers",
              ]}
              calendarLink={googleCalLink}
              mapLink={ceremonyMapLink}
              isAllRevealed={revealAll}
            />
          </Reveal>

          <Reveal delay={0.25}>
            <ScratchCard
              title="The Royal Reception"
              subtitle="Celebration of Love"
              icon="🥂"
              time="IMMEDIATELY AFTER"
              venue={receptionVenue}
              address={receptionAddress}
              highlights={[
                "Grand Royal Couple Entrance",
                "Cutting of the Wedding Cake",
                "Sumptuous Feast & Refreshments",
                "Traditional Dances & Festivities",
              ]}
              calendarLink={googleCalLink}
              mapLink={receptionMapLink}
              isAllRevealed={revealAll}
            />
          </Reveal>
        </div>

        {/* Note below */}
        <p className="mt-12 text-center text-xs tracking-wider text-champagne/50">
          We kindly request all guests to be seated at the church sanctuary 15 minutes prior to the commencement.
        </p>
      </div>
    </section>
  );
}
