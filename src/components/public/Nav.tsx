"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "/", label: "Home" },
  { href: "/#story", label: "Our Story" },
  { href: "/#programme", label: "Programme" },
  { href: "/#colour-theme", label: "Colour Theme" },
  { href: "/#gifting", label: "Gifting" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faqs", label: "FAQs" },
  { href: "/invitation", label: "My Invitation" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        scrolled || open
          ? "bg-wine/95 shadow-xl shadow-wine/40 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-[0.2em] text-champagne"
          onClick={() => setOpen(false)}
        >
          DELOUS<span className="gold-text"> &rsquo;26</span>
        </Link>

        <nav className="hidden items-center gap-6 lg:gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs lg:text-sm tracking-wide text-champagne/80 transition hover:text-gold"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/register"
            className="rounded-full border border-gold bg-gold/15 px-5 py-2 text-xs lg:text-sm font-semibold tracking-wide text-gold transition hover:bg-gold hover:text-wine shadow-sm"
          >
            Register
          </Link>
        </nav>

        <button
          aria-label="Toggle navigation menu"
          className="text-champagne md:hidden p-1 rounded-lg hover:bg-white/10 transition"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-wine/95 backdrop-blur-lg border-b border-gold/20 md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 pb-6 pt-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-champagne/90 transition hover:bg-burgundy hover:text-gold"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="mt-3 rounded-full border border-gold bg-gold px-5 py-3 text-center text-sm font-semibold text-wine shadow-md"
              >
                Register to Attend
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
