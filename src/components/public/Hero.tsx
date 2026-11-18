"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import Countdown from "./Countdown";
import { EVENT } from "@/lib/constants";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, delay: 0.2 + i * 0.2, ease: "easeOut" as const },
  }),
};

// Curated high-resolution photography for hero carousel
const HERO_SLIDES = [
  {
    image: "/images/hero.jpg",
    title: "A Royal Celebration",
    caption: "The Sacred Union of Olasubulumi & Dare",
  },
  {
    image: "/corporate/_NZ55107-Edit.jpg",
    title: "Cultural Royalty & Poise",
    caption: "A Heritage of Grace and Divine Favor",
  },
  {
    image: "/corporate/_NZ55232-Edit.jpg",
    title: "Forever Sealed",
    caption: "Joy Unspeakable & Boundless Love",
  },
  {
    image: "/corporate/_NZ55191-Edit.jpg",
    title: "Two Souls in Harmony",
    caption: "A Lifetime of Friendship Becoming One",
  },
  {
    image: "/casual/IMG_9657.CR2.jpg",
    title: "Our Purest Haven",
    caption: "From Secondary School Classmates to Eternity",
  },
];

const SLIDE_DURATION = 6500; // 6.5 seconds per slide

export default function Hero({
  tagline,
  dateISO,
}: {
  tagline: string;
  dateISO: string;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index: number) => {
    setCurrent(index);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-wine px-5 pb-24 pt-32 text-center select-none">
      {/* Background Image Carousel with Ken Burns & Smooth Crossfade */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <AnimatePresence mode="sync">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('${HERO_SLIDES[current].image}')`,
            }}
          />
        </AnimatePresence>

        {/* Multi-layered luxury color gradients for optimal text contrast and romance */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#140308] via-[#260811c7] to-[#140308bf]" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#26081199] to-[#140308f2]" />
      </div>

      {/* Floating Star Ornaments */}
      <div className="float-slow pointer-events-none absolute left-8 top-32 text-3xl text-gold/30 hidden sm:block">
        ✦
      </div>
      <div
        className="float-slow pointer-events-none absolute right-12 top-48 text-2xl text-gold/25 hidden sm:block"
        style={{ animationDelay: "2s" }}
      >
        ❖
      </div>
      <div
        className="float-slow pointer-events-none absolute bottom-36 left-16 text-3xl text-gold/20 hidden sm:block"
        style={{ animationDelay: "4s" }}
      >
        ✦
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-4xl flex flex-col items-center">
        {/* Kicker badge */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="inline-flex items-center gap-2 rounded-full bg-wine/70 px-5 py-1.5 backdrop-blur-md"
        >
          <span className="text-gold text-xs">✦</span>
          <span className="text-[10px] sm:text-xs font-semibold tracking-[0.4em] uppercase text-gold">
            Ẹ KÁÀBỌ̀ &bull; THE ROYAL UNION OF TWO FAMILIES
          </span>
          <span className="text-gold text-xs">✦</span>
        </motion.div>

        {/* Couple Names */}
        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-7 font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-tight text-champagne drop-shadow-xl"
        >
          Olasubulumi Adesola
          <span className="gold-text mx-3 inline-block font-display italic sm:mx-5">
            &amp;
          </span>
          Dare Samuel
        </motion.h1>

        {/* Event Monogram & Date */}
        <motion.div
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-6 flex flex-col items-center"
        >
          <div className="gold-text font-display text-2xl sm:text-4xl font-semibold tracking-[0.3em]">
            DELOUS &rsquo;26
          </div>
          <div className="ornament-divider mt-3 w-48 text-gold/60 text-xs">✦</div>
          <p className="mt-3 text-xs sm:text-sm tracking-[0.3em] uppercase text-champagne/90">
            {EVENT.dateLabel} &bull; LAGOS, NIGERIA
          </p>
          <p className="mt-3 max-w-xl font-display text-base sm:text-xl italic text-champagne/80 font-light">
            &ldquo;{tagline}&rdquo;
          </p>
        </motion.div>

        {/* Live Countdown Timer */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-10"
        >
          <Countdown targetISO={dateISO} />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/register"
            className="group flex items-center gap-2 rounded-full bg-gold px-9 py-4 font-semibold tracking-wide text-xs sm:text-sm text-wine shadow-xl shadow-gold/25 transition-all duration-300 hover:scale-105 hover:bg-champagne"
          >
            <span>JOIN US</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>

        </motion.div>
      </div>

      {/* Hero Carousel Navigation Controls & Indicator Dots */}
      <div className="relative z-20 mt-14 flex flex-col items-center gap-3">
        {/* Navigation Buttons and Indicators */}
        <div className="flex items-center gap-4">
          <button
            onClick={prevSlide}
            type="button"
            aria-label="Previous slide"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/30 bg-wine/60 text-sm text-champagne/70 backdrop-blur hover:border-gold hover:text-gold transition"
          >
            &#8249;
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                type="button"
                aria-label={`Go to slide ${idx + 1}: ${slide.title}`}
                className="group relative h-2.5 rounded-full transition-all duration-500 overflow-hidden focus:outline-none"
                style={{ width: current === idx ? "2.5rem" : "0.6rem" }}
              >
                <div
                  className={`h-full w-full rounded-full transition-colors ${
                    current === idx ? "bg-gold" : "bg-champagne/30 group-hover:bg-champagne/60"
                  }`}
                />
              </button>
            ))}
          </div>

          <button
            onClick={nextSlide}
            type="button"
            aria-label="Next slide"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/30 bg-wine/60 text-sm text-champagne/70 backdrop-blur hover:border-gold hover:text-gold transition"
          >
            &#8250;
          </button>
        </div>

        {/* Current slide subtitle */}
        <p className="text-[11px] uppercase tracking-[0.25em] text-champagne/60 italic">
          {HERO_SLIDES[current].title}
        </p>
      </div>

      {/* Down Scroll Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none opacity-60">
        <div className="flex flex-col items-center gap-1 text-[10px] tracking-widest text-champagne/70 uppercase">
          <span>SCROLL</span>
          <span className="animate-bounce text-gold">↓</span>
        </div>
      </div>
    </section>
  );
}
