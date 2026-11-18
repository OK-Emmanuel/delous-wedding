"use client";

import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { CrownIcon } from "@hugeicons/core-free-icons";
import Reveal from "./Reveal";

interface ColourOfTheDayProps {
  customDressCode?: string;
}

export default function ColourOfTheDay({ customDressCode }: ColourOfTheDayProps) {
  const colours = [
    {
      name: "Pristine White",
      yoruba: "Funfun Tútù",
      hex: "#FFFFFF",
      border: "border-gold/50",
      description: "Symbol of divine grace, purity, joy, and the dawn of a sacred new beginning.",
      fabric: "Silk, Damask, Fine Cotton, Brocade",
    },
    {
      name: "Traditional Ofi",
      yoruba: "Aṣọ-Òfì Ọba",
      hex: "#C6A15B",
      bgClass: "bg-gradient-to-br from-[#d4af37] via-[#c6a15b] to-[#997a36]",
      border: "border-gold",
      description: "Authentic Yoruba handwoven heritage fabric woven with shimmering metallic threads.",
      fabric: "Handcrafted Ofi / Aṣọ-Òkè Weave",
    },
    {
      name: "Royal Burgundy",
      yoruba: "Àwọ̀ Wáìnì Ọlọ́lá",
      hex: "#541323",
      bgClass: "bg-gradient-to-br from-[#6b182d] to-[#3a0c18]",
      border: "border-gold/40",
      description: "A rich celebratory accent representing majesty, warmth, and enduring love.",
      fabric: "Velvet, Satin, Beaded Accents",
    },
    {
      name: "Champagne Gold",
      yoruba: "Gòólù Ìgbádùn",
      hex: "#F2E7D4",
      bgClass: "bg-gradient-to-br from-[#faf4e8] to-[#dfcead]",
      border: "border-gold/40",
      description: "Subtle celebratory shimmer adding luminous radiance to traditional royal regalia.",
      fabric: "Metallic Threading, Jewelry & Accents",
    },
  ];

  return (
    <section id="colour-theme" className="relative overflow-hidden bg-[#18050c] text-champagne py-28 lg:py-36">
      {/* Background cultural photography with dark luxury grading */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/corporate/_NZ55155-Edit.jpg"
          alt="Couple in cultural elegance"
          fill
          priority={false}
          className="object-cover object-center opacity-30 mix-blend-luminosity filter contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#18050c] via-[#18050ce6] to-[#18050cd9]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#18050c] via-transparent to-[#18050c]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8">
        <Reveal>
          <div className="flex flex-col items-center text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-1.5 text-xs uppercase tracking-[0.4em] text-gold">
              <span>✦</span>
              <span>ÀṢÀ ÀTI ẸWÀ &bull; TRADITION &amp; BEAUTY</span>
              <span>✦</span>
            </span>

            <h2 className="mt-4 font-display text-4xl sm:text-6xl md:text-7xl font-medium tracking-tight text-champagne">
              Colour of the Day
            </h2>

            <div className="ornament-divider mx-auto mt-6 max-w-sm text-gold">❖</div>

            <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-champagne/80 font-light">
              We invite our distinguished guests to partake in the vibrant richness of
              our Yoruba cultural heritage. Dress in your most splendid traditional attire
              as we paint this celebration with timeless elegance.
            </p>
          </div>
        </Reveal>

        {/* Torn-Paper Layered Editorial Showcase */}
        <div className="mt-16 relative">
          <Reveal delay={0.15}>
            {/* Torn Paper Header Banner */}
            <div className="relative mx-auto max-w-4xl drop-shadow-2xl">
              {/* Ripped Paper Top Edge (SVG Deckle Edge) */}
              <div className="w-full overflow-hidden leading-none">
                <svg
                  viewBox="0 0 1200 35"
                  className="w-full h-7 sm:h-9 text-ivory fill-current preserve-3d"
                  preserveAspectRatio="none"
                >
                  <path d="M0,35 L0,18 Q35,8 70,16 T140,12 T210,19 T280,10 T350,17 T420,9 T490,18 T560,11 T630,20 T700,10 T770,16 T840,11 T910,19 T980,12 T1050,18 T1120,9 T1200,16 L1200,35 Z" />
                </svg>
              </div>

              {/* Textured Paper Content Body */}
              <div
                className="relative bg-ivory text-rich-black px-6 sm:px-12 py-10 sm:py-14 shadow-2xl"
                style={{
                  backgroundImage:
                    "radial-gradient(#d3c7b3 0.75px, transparent 0.75px), radial-gradient(#d3c7b3 0.75px, #faf6ef 0.75px)",
                  backgroundSize: "24px 24px",
                  backgroundPosition: "0 0, 12px 12px",
                }}
              >
                {/* Paper Texture Overlay */}
                <div className="pointer-events-none absolute inset-0 opacity-20 bg-gradient-to-b from-black/5 via-transparent to-black/10" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="text-center md:text-left">
                    <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-burgundy">
                      OFFICIAL WEDDING ATTIRE
                    </span>
                    <h3 className="mt-2 font-display text-4xl sm:text-6xl font-bold tracking-tight text-burgundy">
                      White &amp; Ofi
                    </h3>
                   
                    {customDressCode && customDressCode !== "White & Ofi" && (
                      <p className="mt-2 text-xs text-burgundy/80 font-medium">
                        Additional note: {customDressCode}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-burgundy/30 bg-champagne/40 px-8 py-6 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
                      <HugeiconsIcon icon={CrownIcon} size={28} />
                    </span>
                    <span className="mt-2 font-display text-lg font-semibold text-burgundy">
                      Royal Dress Code
                    </span>
                    <span className="text-xs tracking-widest text-rich-black/70 uppercase mt-1">
                      Traditional Attire Warmly Encouraged
                    </span>
                  </div>
                </div>

                {/* Swatches Grid inside the paper editorial */}
                {/* <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {colours.map((c, i) => (
                    <div
                      key={i}
                      className="group relative flex flex-col rounded-2xl border border-rich-black/10 bg-white/80 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <div
                        className={`h-24 w-full rounded-xl border ${c.border} ${
                          c.bgClass || ""
                        } relative overflow-hidden shadow-inner flex items-end p-2.5`}
                        style={{ backgroundColor: c.bgClass ? undefined : c.hex }}
                      >
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider ${
                            c.hex === "#FFFFFF"
                              ? "bg-rich-black/80 text-white"
                              : "bg-black/60 text-champagne"
                          }`}
                        >
                          {c.hex}
                        </span>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-baseline justify-between">
                          <h4 className="font-display text-lg font-semibold text-burgundy">
                            {c.name}
                          </h4>
                        </div>
                        <p className="text-[11px] font-serif italic text-gold font-medium">
                          {c.yoruba}
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-rich-black/70">
                          {c.description}
                        </p>
                        <div className="mt-3 border-t border-rich-black/10 pt-2">
                          <span className="text-[10px] uppercase tracking-wider text-rich-black/50">
                            Suggested Fabric:
                          </span>
                          <p className="text-xs font-medium text-rich-black/80">
                            {c.fabric}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div> */}

                {/* Style Inspiration Guides for Guests */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-rich-black/10">
                  <div className="rounded-2xl bg-white/70 p-6 border border-rich-black/5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-burgundy text-champagne font-serif font-bold">
                        G
                      </span>
                      <div>
                        <h4 className="font-display text-xl font-bold text-burgundy">
                          Gentlemen&apos;s Styling Guide
                        </h4>
                        <p className="text-xs text-rich-black/60">Royal Agbada / Kaftan</p>
                      </div>
                    </div>
                    <p className="mt-4 text-xs sm:text-sm leading-relaxed text-rich-black/80">
                      Step out in majestic White Agbada or tailored Kaftan, crowned with an
                      authentic <strong>Ofi Fila</strong> (cap) shaped to your preference. Pair
                      with classic leather footwear and celebratory accessories.
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/70 p-6 border border-rich-black/5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold text-wine font-serif font-bold">
                        L
                      </span>
                      <div>
                        <h4 className="font-display text-xl font-bold text-burgundy">
                          Ladies&apos; Styling Guide
                        </h4>
                        <p className="text-xs text-rich-black/60">Iro &amp; Buba / Luxury Gown</p>
                      </div>
                    </div>
                    <p className="mt-4 text-xs sm:text-sm leading-relaxed text-rich-black/80">
                      Adorn yourself in elegant White Iro &amp; Buba, lace, or floor-length gown,
                      crowned with a masterfully styled <strong>Ofi Gele</strong> (head-tie) and
                      draped <strong>Ipele</strong> (shoulder sash) to celebrate in royal grandeur.
                    </p>
                  </div>
                </div>

                {/* Cultural Blessing Footer on Paper */}
                <p className="mt-10 text-center font-display italic text-base sm:text-lg text-burgundy">
                  &ldquo;Aṣọ la fi ń mọ̀ràn, ẹwà la fi ń gbéraga &bull; In royal attire we honor love and legacy.&rdquo;
                </p>
              </div>

              {/* Ripped Paper Bottom Edge (SVG Deckle Edge) */}
              <div className="w-full overflow-hidden leading-none">
                <svg
                  viewBox="0 0 1200 35"
                  className="w-full h-7 sm:h-9 text-ivory fill-current preserve-3d"
                  preserveAspectRatio="none"
                >
                  <path d="M0,0 L0,17 Q35,27 70,19 T140,23 T210,16 T280,25 T350,18 T420,26 T490,17 T560,24 T630,15 T700,25 T770,19 T840,24 T910,16 T980,23 T1050,17 T1120,26 T1200,19 L1200,0 Z" />
                </svg>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
