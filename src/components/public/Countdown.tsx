"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function remaining(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function Unit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-gold/40 bg-wine/60 backdrop-blur md:h-28 md:w-28">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={display}
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="font-display text-4xl font-semibold text-champagne md:text-6xl"
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-2 text-[11px] tracking-[0.3em] text-gold md:text-xs">
        {label}
      </span>
    </div>
  );
}

/** Wedding countdown in Lagos time (the target carries its +01:00 offset). */
export default function Countdown({ targetISO }: { targetISO: string }) {
  const [time, setTime] = useState<ReturnType<typeof remaining> | null>(null);

  useEffect(() => {
    const target = new Date(targetISO);
    setTime(remaining(target));
    const id = setInterval(() => setTime(remaining(target)), 1000);
    return () => clearInterval(id);
  }, [targetISO]);

  if (!time) {
    return <div className="h-32 md:h-40" aria-hidden />;
  }

  const done =
    time.days === 0 && time.hours === 0 && time.minutes === 0 && time.seconds === 0;

  if (done) {
    return (
      <p className="gold-text font-display text-3xl italic md:text-5xl">
        Ìdùnnú pọ̀! The celebration is here!
      </p>
    );
  }

  return (
    <div className="flex items-start justify-center gap-3 md:gap-6">
      <Unit value={time.days} label="DAYS" />
      <Unit value={time.hours} label="HOURS" />
      <Unit value={time.minutes} label="MINUTES" />
      <Unit value={time.seconds} label="SECONDS" />
    </div>
  );
}
