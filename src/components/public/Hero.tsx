"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Countdown from "./Countdown";
import { EVENT } from "@/lib/constants";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: 0.3 + i * 0.25, ease: "easeOut" as const },
  }),
};

export default function Hero({
  tagline,
  dateISO,
}: {
  tagline: string;
  dateISO: string;
}) {
  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-wine px-5 pb-20 pt-32 text-center"
      style={{
        // Drop the couple's hero photograph into /public/images/hero.jpg
        backgroundImage:
          "linear-gradient(to bottom, rgba(38,8,17,0.82), rgba(38,8,17,0.92)), url('/images/hero.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* floating ornaments */}
      <div className="float-slow pointer-events-none absolute left-8 top-28 text-4xl text-gold/30">✦</div>
      <div className="float-slow pointer-events-none absolute right-10 top-48 text-2xl text-gold/20" style={{ animationDelay: "2s" }}>❖</div>
      <div className="float-slow pointer-events-none absolute bottom-32 left-16 text-3xl text-gold/20" style={{ animationDelay: "4s" }}>✦</div>

      <motion.p
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="text-[11px] tracking-[0.45em] text-gold md:text-sm"
      >
        THE UNION OF TWO FAMILIES · THE CELEBRATION OF A LIFETIME
      </motion.p>

      <motion.h1
        custom={1}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mt-8 font-display text-4xl font-medium leading-tight text-champagne md:text-7xl"
      >
        Olasubulumi Adesola
        <span className="gold-text mx-3 inline-block font-display italic md:mx-5">&amp;</span>
        Dare Samuel
      </motion.h1>

      <motion.div
        custom={2}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mt-8"
      >
        <div className="gold-text font-display text-2xl font-semibold tracking-[0.3em] md:text-4xl">
          DELOUS &rsquo;26
        </div>
        <p className="mt-3 text-sm tracking-[0.25em] text-champagne/80 md:text-base">
          {EVENT.dateLabel.toUpperCase()} · LAGOS, NIGERIA
        </p>
        <p className="mt-4 font-display text-lg italic text-champagne/70 md:text-xl">
          {tagline}
        </p>
      </motion.div>

      <motion.div
        custom={3}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mt-12"
      >
        <Countdown targetISO={dateISO} />
      </motion.div>

      <motion.div
        custom={4}
        variants={fadeUp}
        initial="hidden"
        animate="show"
        className="mt-12 flex flex-col items-center gap-4 sm:flex-row"
      >
        <Link
          href="/register"
          className="rounded-full bg-gold px-10 py-4 font-medium tracking-wide text-wine shadow-lg shadow-gold/20 transition hover:scale-105 hover:bg-champagne"
        >
          Register to Attend
        </Link>
        <Link
          href="/#programme"
          className="rounded-full border border-champagne/40 px-10 py-4 tracking-wide text-champagne transition hover:border-gold hover:text-gold"
        >
          View Programme
        </Link>
      </motion.div>
    </section>
  );
}
