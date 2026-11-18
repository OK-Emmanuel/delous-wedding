"use client";

import { useState } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GiftIcon,
  Copy01Icon,
  CheckmarkCircle01Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import Reveal from "./Reveal";

export default function GiftingSection() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const accountNumber = "8154187731";
  const accountName = "Olasubulumi Adesola";
  const bankName = "PalmPay";

  const handleCopy = async (text: string, field: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedField(field);
      setTimeout(() => {
        setCopiedField((current) => (current === field ? null : current));
      }, 2500);
    } catch {
      // Graceful fallback
    }
  };

  const fullTransferNote = `Bank: ${bankName}\nAccount Name: ${accountName}\nAccount Number: ${accountNumber}`;

  return (
    <section
      id="gifting"
      className="relative w-full min-h-screen lg:h-screen lg:min-h-[720px] overflow-hidden bg-[#120207] text-champagne flex flex-col lg:flex-row"
    >
      {/* LEFT SIDE: Couple's Photograph (50% on desktop) */}
      <div className="relative w-full lg:w-1/2 h-[380px] sm:h-[460px] lg:h-full overflow-hidden bg-wine">
        <Image
          src="/corporate/_NZ55155-Edit.jpg"
          alt="Olasubulumi and Dare in royal elegance"
          fill
          priority={false}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-top filter brightness-[0.92] contrast-[1.05] transition-transform duration-1000 hover:scale-105"
        />

        {/* Ambient Dark Gradient Vignette for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#120207] via-transparent to-black/30 lg:bg-gradient-to-r lg:from-transparent lg:via-black/20 lg:to-[#120207]" />

        {/* Subtle Decorative Golden Corner Accent */}
        <div className="absolute top-6 left-6 z-10 hidden sm:flex items-center gap-2 rounded-full border border-gold/40 bg-wine/60 px-4 py-1.5 backdrop-blur-md">
          <HugeiconsIcon icon={SparklesIcon} size={14} className="text-gold" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-champagne">
            DELOUS &rsquo;26 &bull; CELEBRATING LOVE
          </span>
        </div>

        {/* Bottom Caption on Left Image */}
        <div className="absolute bottom-6 left-6 right-6 z-10 hidden sm:block">
          <p className="font-display text-xl sm:text-2xl italic text-champagne drop-shadow-md">
            &ldquo;Your prayers and presence are the greatest gifts of all.&rdquo;
          </p>
          <p className="text-[11px] uppercase tracking-[0.25em] text-gold/90 mt-1">
            Olasubulumi &amp; Dare Samuel
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Donation Information & CTAs (50% on desktop) */}
      <div className="relative w-full lg:w-1/2 min-h-full flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-gradient-to-b lg:bg-gradient-to-br from-[#260713] via-[#1a040d] to-[#100206] shadow-2xl">
        {/* Subtle Background Glow */}
        <div className="pointer-events-none absolute -right-20 top-1/4 h-80 w-80 rounded-full bg-gold/10 blur-[120px]" />

        <div className="relative z-10 max-w-xl mx-auto lg:mx-0 w-full">
          <Reveal>
            <div className="flex items-center gap-2 text-gold">
              <HugeiconsIcon icon={GiftIcon} size={18} />
              <span className="text-xs uppercase tracking-[0.4em] font-semibold">
                LOVE &amp; APPRECIATION
              </span>
            </div>

            <h2 className="mt-3 font-display text-4xl sm:text-5xl font-medium text-champagne tracking-tight">
              Gifts &amp; Blessings
            </h2>

            <div className="ornament-divider mt-4 mb-5 max-w-xs text-xs text-gold">✦</div>

            <p className="text-sm sm:text-base leading-relaxed text-champagne/80 font-light">
              Your prayers, warm wishes, and presence on our special day are the greatest gifts we could ever ask for. Should you feel moved to honour us with a monetary gift towards our new beginning, our account details are below with heartfelt gratitude.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            {/* Account Card Container */}
            <div className="mt-8 rounded-3xl border border-gold/40 bg-gradient-to-br from-[#330a1a]/90 to-[#1e050f]/90 p-6 sm:p-8 backdrop-blur-md shadow-2xl shadow-burgundy/30">
              {/* Bank Header */}
              <div className="flex items-center justify-between border-b border-gold/20 pb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-champagne/60">
                    Payment Platform
                  </span>
                  <h3 className="font-display text-2xl sm:text-3xl font-medium text-gold">
                    {bankName}
                  </h3>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-3 py-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                    Direct Transfer
                  </span>
                </div>
              </div>

              {/* Account Number Box */}
              <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-champagne/60">
                    Account Number
                  </p>
                  <p className="mt-1 font-mono text-2xl sm:text-3xl font-bold tracking-wider text-champagne">
                    {accountNumber}
                  </p>
                </div>

                <button
                  onClick={() => handleCopy(accountNumber, "number")}
                  type="button"
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-semibold tracking-wider transition-all duration-300 ${
                    copiedField === "number"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                      : "bg-gold text-wine hover:bg-champagne hover:scale-105 shadow-md shadow-gold/20"
                  }`}
                  aria-label="Copy account number"
                >
                  {copiedField === "number" ? (
                    <>
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} />
                      <span>COPIED NUMBER!</span>
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={Copy01Icon} size={16} />
                      <span>COPY NUMBER</span>
                    </>
                  )}
                </button>
              </div>

              {/* Beneficiary Name */}
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-champagne/60">
                    Beneficiary / Account Name
                  </p>
                  <p className="mt-1 font-display text-xl font-medium text-gold">
                    {accountName}
                  </p>
                </div>
                <span className="text-xs text-champagne/50 italic">
                  Bride&apos;s Account
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <button
                onClick={() => handleCopy(fullTransferNote, "all")}
                type="button"
                className="text-xs tracking-wider text-champagne/70 underline-offset-4 hover:text-gold hover:underline transition inline-flex items-center gap-1.5"
              >
                {copiedField === "all" ? (
                  <>
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="text-emerald-400" />
                    <span>All Details Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={Copy01Icon} size={14} className="text-gold" />
                    <span>Copy Complete Transfer Details</span>
                  </>
                )}
              </button>

              <span className="text-xs text-champagne/45 font-light">
                Secured via Nigerian PalmPay Banking Network
              </span>
            </div>

            <p className="mt-6 text-xs text-champagne/50 leading-relaxed text-center sm:text-left">
              May God almighty bless and replenish you abundantly for your love and generosity.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
