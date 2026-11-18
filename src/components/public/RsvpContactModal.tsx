"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import { Call02Icon, WhatsappIcon } from "@hugeicons/core-free-icons";
import { normalizePhone } from "@/lib/constants";

interface RsvpContactModalProps {
  contactString: string;
  className?: string;
}

export function parseContact(contact: string): { name: string; rawPhone: string; intlPhone: string } {
  const parts = contact.split(":");
  let name = "RSVP Contact";
  let rawPhone = contact.trim();

  if (parts.length >= 2) {
    name = parts[0].trim();
    rawPhone = parts.slice(1).join(":").trim();
  }

  const normalized = normalizePhone(rawPhone) ?? rawPhone.replace(/\D/g, "");
  return {
    name,
    rawPhone,
    intlPhone: normalized,
  };
}

export default function RsvpContactModal({ contactString, className }: RsvpContactModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { name, rawPhone, intlPhone } = parseContact(contactString);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const callUrl = `tel:+${intlPhone}`;
  const whatsappMsg = encodeURIComponent(
    `Hello ${name}, I am reaching out regarding the DELOUS '26 wedding celebration of G Sam and Dessy.`
  );
  const whatsappUrl = `https://wa.me/${intlPhone}?text=${whatsappMsg}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          className ??
          "group flex items-center gap-2 rounded-lg py-1 px-2 text-left text-sm text-champagne/85 transition hover:bg-gold/10 hover:text-gold"
        }
        aria-label={`Contact ${name}`}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/20 text-gold transition group-hover:bg-gold group-hover:text-wine">
          <HugeiconsIcon icon={Call02Icon} size={13} />
        </span>
        <span className="font-medium text-champagne underline-offset-4 group-hover:underline">
          {name}: <span className="font-mono text-champagne/80">{rawPhone}</span>
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-rich-black/80 backdrop-blur-sm"
            />

            {/* Modal Dialog */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby={`rsvp-title-${name}`}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative z-10 w-full max-w-sm overflow-hidden rounded-3xl border border-gold/40 bg-gradient-to-b from-[#2e0915] to-[#1a050d] p-6 text-champagne shadow-2xl shadow-burgundy/40"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-champagne/20 text-champagne/70 transition hover:border-gold hover:bg-gold/10 hover:text-gold"
                aria-label="Close contact dialog"
              >
                &times;
              </button>

              <div className="text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-gold">
                  <span>✦</span>
                  <span>RSVP &bull; ENQUIRIES</span>
                  <span>✦</span>
                </span>

                <h3 id={`rsvp-title-${name}`} className="mt-4 font-display text-2xl font-medium text-champagne">
                  {name}
                </h3>
                <p className="mt-1 font-mono text-sm tracking-wider text-gold">
                  {rawPhone}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-champagne/70">
                  Choose how you would like to reach out to our RSVP team.
                </p>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col gap-3">
                {/* Phone Call */}
                <a
                  href={callUrl}
                  className="group flex items-center justify-center gap-3 rounded-2xl bg-gold px-5 py-3.5 text-xs font-semibold tracking-wider text-wine shadow-lg shadow-gold/20 transition-all hover:scale-[1.02] hover:bg-champagne"
                >
                  <HugeiconsIcon icon={Call02Icon} size={18} className="transition group-hover:scale-110" />
                  <span>CALL DIRECT ({rawPhone})</span>
                </a>

                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/60 px-5 py-3.5 text-xs font-semibold tracking-wider text-emerald-300 shadow-lg shadow-emerald-950/40 transition-all hover:scale-[1.02] hover:bg-emerald-900/80 hover:text-white"
                >
                  <HugeiconsIcon icon={WhatsappIcon} size={18} className="transition group-hover:scale-110 text-emerald-400 group-hover:text-white" />
                  <span>CHAT ON WHATSAPP</span>
                </a>
              </div>

              <div className="mt-5 border-t border-gold/20 pt-3 text-center">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-xs text-champagne/50 hover:text-champagne transition underline-offset-4 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
