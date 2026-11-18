"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * Cinematic opening animation with persistent display on every reload (Requirement 1).
 * Only bypassed when the visitor explicitly clicks the Skip or Enter button.
 * Does not store state in localStorage/sessionStorage.
 */
export default function Intro() {
  const [show, setShow] = useState(true);
  const [step, setStep] = useState(1);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const timers = [
      setTimeout(() => setStep(2), 2200),
      setTimeout(() => setStep(3), 4400),
    ];

    return () => {
      timers.forEach(clearTimeout);
      document.body.style.overflow = "";
    };
  }, []);

  const handleDismiss = () => {
    document.body.style.overflow = "";
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="welcome-intro-overlay"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            filter: "blur(10px)",
            transition: { duration: 0.95, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-wine px-6 text-center select-none"
        >
          {/* Ambient radial lighting and subtle floating golden flecks */}
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(ellipse at 50% 45%, rgba(198, 161, 91, 0.22) 0%, rgba(38, 8, 17, 0.9) 70%, #17050b 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(#c6a15b 1px, transparent 1px), radial-gradient(#c6a15b 1px, #17050b 1px)",
              backgroundSize: "40px 40px",
              backgroundPosition: "0 0, 20px 20px",
            }}
          />

          {/* Top Skip Button */}
          <div className="absolute top-6 right-6 z-20">
            <button
              onClick={handleDismiss}
              type="button"
              className="group flex items-center gap-2 rounded-full border border-gold/40 bg-wine/60 px-5 py-2 text-xs tracking-[0.25em] text-champagne backdrop-blur-md transition-all duration-300 hover:border-gold hover:bg-gold hover:text-wine hover:shadow-lg hover:shadow-gold/20"
              aria-label="Skip introduction"
            >
              <span>SKIP INTRO</span>
              <span className="transition-transform duration-300 group-hover:translate-x-0.5 text-gold group-hover:text-wine">✦</span>
            </button>
          </div>

          {/* Center Stage Animation */}
          <div className="relative z-10 flex min-h-[300px] max-w-2xl flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="greeting-yoruba"
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <p className="text-xs uppercase tracking-[0.5em] text-gold">
                    A Royal Yoruba Welcome
                  </p>
                  <h2 className="font-display text-3xl italic text-champagne sm:text-5xl md:text-6xl">
                    Ẹ káàbọ̀ sí ìgbéyáwó wa
                  </h2>
                  <p className="font-display text-lg text-champagne/70 sm:text-xl">
                    Welcome to our wedding celebration
                  </p>
                  <div className="ornament-divider mx-auto mt-4 max-w-xs text-gold/60 text-xs">✦</div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="theme-love"
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <p className="text-xs uppercase tracking-[0.5em] text-gold">
                    The Foundation of Everything
                  </p>
                  <h2 className="font-display text-3xl italic text-champagne sm:text-5xl md:text-6xl">
                    Ìfẹ́ ni gbogbo rẹ̀
                  </h2>
                  <p className="font-display text-lg text-champagne/70 sm:text-xl">
                    Love is everything &bull; Two hearts becoming one
                  </p>
                  <div className="ornament-divider mx-auto mt-4 max-w-xs text-gold/60 text-xs">❖</div>
                </motion.div>
              )}

              {step >= 3 && (
                <motion.div
                  key="grand-reveal"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                  className="flex flex-col items-center text-center"
                >
                  <p className="text-[11px] uppercase tracking-[0.5em] text-gold sm:text-xs">
                    THE ROYAL CELEBRATION
                  </p>

                  <h1 className="mt-4 font-display text-3xl font-medium tracking-wide text-champagne sm:text-5xl md:text-6xl">
                    Olasubulumi &amp; Dare
                  </h1>

                  <div className="gold-text mt-4 font-display text-4xl font-semibold tracking-[0.25em] sm:text-6xl md:text-7xl">
                    DELOUS &rsquo;26
                  </div>

                  <p className="mt-4 text-xs tracking-[0.45em] text-champagne/80 sm:text-sm">
                    SATURDAY, 28 NOVEMBER 2026 &bull; LAGOS, NIGERIA
                  </p>

                  <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
                    <button
                      onClick={handleDismiss}
                      type="button"
                      className="flex items-center gap-3 rounded-full bg-gold px-9 py-3.5 font-medium tracking-[0.2em] text-xs text-wine shadow-xl shadow-gold/20 transition-all duration-300 hover:scale-105 hover:bg-champagne cursor-pointer"
                    >
                      <span>CELEBRATE WITH US</span>
                      <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Subtle bottom indicator dots */}
          <div className="absolute bottom-8 flex items-center gap-3">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  step === s ? "w-6 bg-gold" : "w-1.5 bg-gold/30"
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
