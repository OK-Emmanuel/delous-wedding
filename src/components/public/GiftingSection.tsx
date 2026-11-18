"use client";

import { useState } from "react";
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
    <section id="gifting" className="relative overflow-hidden bg-ivory px-5 py-24 sm:py-28">
      {/* Subtle decorative background watermarks */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-burgundy/5 blur-3xl" />

      <div className="relative mx-auto max-w-4xl">
        <Reveal>
          <div className="mb-12 text-center">
            <p className="text-xs uppercase tracking-[0.45em] text-gold">
              LOVE &amp; APPRECIATION
            </p>
            <h2 className="mt-3 font-display text-4xl font-medium text-burgundy sm:text-5xl">
              Gifts &amp; Blessings
            </h2>
            <div className="ornament-divider mx-auto mt-5 max-w-xs text-sm">✦</div>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-rich-black/75 sm:text-lg">
              Your prayers, love, and presence as we celebrate our holy union are the
              greatest gifts we could ever receive. If your heart moves you to honor us
              further with a monetary blessing towards our new life together, we receive
              it with immense joy and profound gratitude.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="relative mx-auto max-w-2xl rounded-3xl border border-gold/40 bg-gradient-to-b from-[#2d0915] to-[#1c050d] p-8 text-champagne shadow-2xl shadow-burgundy/25 sm:p-12">
            {/* Ornate corner ornaments */}
            <div className="pointer-events-none absolute left-4 top-4 font-serif text-lg text-gold/40">⌜</div>
            <div className="pointer-events-none absolute right-4 top-4 font-serif text-lg text-gold/40">⌝</div>
            <div className="pointer-events-none absolute bottom-4 left-4 font-serif text-lg text-gold/40">⌞</div>
            <div className="pointer-events-none absolute bottom-4 right-4 font-serif text-lg text-gold/40">⌟</div>

            <div className="text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1 text-xs tracking-[0.3em] text-gold">
                <span>❖</span>
                <span>DIRECT BANK TRANSFER</span>
                <span>❖</span>
              </span>

              {/* Payment Platform Badge */}
              <div className="mt-6 flex items-center justify-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-champagne/80">
                  Payment Platform
                </span>
              </div>
              <h3 className="mt-1 font-display text-3xl font-medium text-gold sm:text-4xl">
                {bankName}
              </h3>
            </div>

            {/* Account Card Container */}
            <div className="mt-8 space-y-4 rounded-2xl border border-gold/30 bg-wine/70 p-6 backdrop-blur-sm sm:p-8">
              {/* Account Number Box */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-champagne/60">
                    Account Number
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold tracking-wider text-champagne sm:text-3xl">
                    {accountNumber}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(accountNumber, "number")}
                  type="button"
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-xs font-semibold tracking-wider transition-all duration-300 ${
                    copiedField === "number"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                      : "bg-gold text-wine hover:bg-champagne hover:scale-105"
                  }`}
                  aria-label="Copy account number"
                >
                  {copiedField === "number" ? (
                    <>
                      <span>✓</span>
                      <span>COPIED NUMBER!</span>
                    </>
                  ) : (
                    <>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      <span>COPY NUMBER</span>
                    </>
                  )}
                </button>
              </div>

              {/* Beneficiary Name */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.25em] text-champagne/60">
                    Account Name / Beneficiary
                  </p>
                  <p className="mt-1 font-display text-xl font-medium text-gold sm:text-2xl">
                    {accountName}
                  </p>
                </div>
                <span className="text-xs text-champagne/50 italic">
                  Bride&apos;s Account
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
              <button
                onClick={() => handleCopy(fullTransferNote, "all")}
                type="button"
                className="text-xs tracking-[0.2em] text-champagne/70 underline-offset-4 hover:text-gold hover:underline transition"
              >
                {copiedField === "all"
                  ? "✓ All Details Copied to Clipboard!"
                  : "Copy Complete Transfer Details"}
              </button>
            </div>

            <p className="mt-6 text-center text-xs tracking-wide text-champagne/50">
              May God almighty bless and replenish you abundantly for your generosity.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
