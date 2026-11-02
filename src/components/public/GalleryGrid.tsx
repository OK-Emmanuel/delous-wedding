"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type GalleryImage = {
  id: number;
  imageUrl: string;
  caption: string | null;
  altText: string | null;
};

/**
 * Responsive masonry gallery with a full-screen lightbox, keyboard and
 * swipe navigation, and lazy loading (PRD §7).
 */
export default function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const [touchX, setTouchX] = useState<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(
    () => setIndex((i) => (i === null ? null : (i + images.length - 1) % images.length)),
    [images.length],
  );
  const next = useCallback(
    () => setIndex((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, close, prev, next]);

  if (images.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gold/40 bg-white/50 p-16 text-center">
        <p className="font-display text-2xl text-burgundy">
          Ayọ̀ àti ìbùkún — photos coming soon
        </p>
        <p className="mt-2 text-sm text-rich-black/60">
          The pre-wedding gallery will appear here once published.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="columns-2 gap-3 md:columns-3 lg:columns-4 [&>button]:mb-3">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setIndex(i)}
            className="block w-full overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-gold"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.imageUrl}
              alt={img.altText ?? img.caption ?? "Pre-wedding photo"}
              loading="lazy"
              className="w-full transition duration-500 hover:scale-105"
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {index !== null && images[index] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-rich-black/95 p-4"
            onClick={close}
            onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchX === null) return;
              const dx = e.changedTouches[0].clientX - touchX;
              if (dx > 50) prev();
              else if (dx < -50) next();
              setTouchX(null);
            }}
          >
            <button
              aria-label="Close"
              onClick={close}
              className="absolute right-5 top-5 text-3xl text-champagne/80 hover:text-gold"
            >
              ×
            </button>
            <button
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-3 top-1/2 hidden -translate-y-1/2 text-4xl text-champagne/60 hover:text-gold md:block"
            >
              ‹
            </button>
            <motion.img
              key={images[index].id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              src={images[index].imageUrl}
              alt={images[index].altText ?? images[index].caption ?? "Photo"}
              className="max-h-[82vh] max-w-full rounded-lg object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-3 top-1/2 hidden -translate-y-1/2 text-4xl text-champagne/60 hover:text-gold md:block"
            >
              ›
            </button>
            {images[index].caption && (
              <p className="mt-4 font-display text-lg italic text-champagne">
                {images[index].caption}
              </p>
            )}
            <p className="mt-1 text-xs text-champagne/50">
              {index + 1} / {images.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
