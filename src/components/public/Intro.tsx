"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const SEEN_KEY = "delous-intro-seen";

/**
 * Cinematic opening animation with a skip button (PRD §3.2).
 * Returning visitors (sessionStorage) skip it automatically.
 */
export default function Intro() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem(SEEN_KEY)) return;
    setShow(true);
    document.body.style.overflow = "hidden";
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 2200),
      setTimeout(() => setStep(3), 4000),
      setTimeout(() => dismiss(), 5800),
    ];
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismiss() {
    sessionStorage.setItem(SEEN_KEY, "1");
    document.body.style.overflow = "";
    setShow(false);
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-wine"
          exit={{ opacity: 0, transition: { duration: 0.9 } }}
        >
          <div className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              background:
                "radial-gradient(ellipse at center, #C6A15B33 0%, transparent 60%)",
            }}
          />
          <AnimatePresence mode="wait">
            {step >= 1 && step < 2 && (
              <motion.p
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
                className="font-display text-2xl italic text-champagne md:text-4xl"
              >
                Ẹ káàbọ̀ — Welcome
              </motion.p>
            )}
            {step >= 2 && step < 3 && (
              <motion.p
                key="love"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8 }}
                className="font-display text-2xl italic text-champagne md:text-4xl"
              >
                Ìfẹ́ ni gbogbo rẹ̀ — Love is everything
              </motion.p>
            )}
            {step >= 3 && (
              <motion.div
                key="brand"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="text-center"
              >
                <div className="gold-text font-display text-5xl font-semibold tracking-[0.25em] md:text-7xl">
                  DELOUS &rsquo;26
                </div>
                <p className="mt-4 text-sm tracking-[0.4em] text-champagne/70">
                  28 · 11 · 2026
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={dismiss}
            className="absolute bottom-8 right-8 rounded-full border border-champagne/30 px-5 py-2 text-xs tracking-[0.2em] text-champagne/70 transition hover:border-gold hover:text-gold"
          >
            SKIP ✦
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
