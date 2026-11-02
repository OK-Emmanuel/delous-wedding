"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type FaqItem = { id: number; question: string; answer: string };

/** Accessible accordion for FAQs (public page + homepage section). */
export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<number | null>(null);

  if (items.length === 0) {
    return (
      <p className="text-center text-sm text-rich-black/50">
        Questions and answers are coming soon.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div
            key={item.id}
            className="overflow-hidden rounded-xl border border-gold/30 bg-white/70"
          >
            <button
              aria-expanded={open}
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-display text-lg text-burgundy transition hover:bg-champagne/40"
            >
              {item.question}
              <span
                className={`text-gold transition-transform ${open ? "rotate-45" : ""}`}
                aria-hidden
              >
                +
              </span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="px-5 pb-5 text-sm leading-relaxed text-rich-black/70">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
