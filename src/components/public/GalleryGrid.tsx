"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { type GalleryItem } from "@/lib/gallery-sources";

export type { GalleryItem };

interface GalleryGridProps {
  images: GalleryItem[];
  enableFilters?: boolean;
}

export default function GalleryGrid({
  images,
  enableFilters = true,
}: GalleryGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [index, setIndex] = useState<number | null>(null);
  const [touchX, setTouchX] = useState<number | null>(null);

  // Filter images based on selected tab
  const filteredImages =
    selectedCategory === "all"
      ? images
      : images.filter(
          (img) =>
            img.category === selectedCategory ||
            (selectedCategory === "admin" && img.category === "admin")
        );

  const close = useCallback(() => setIndex(null), []);
  const prev = useCallback(
    () =>
      setIndex((i) =>
        i === null ? null : (i + filteredImages.length - 1) % filteredImages.length
      ),
    [filteredImages.length]
  );
  const next = useCallback(
    () =>
      setIndex((i) => (i === null ? null : (i + 1) % filteredImages.length)),
    [filteredImages.length]
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

  const categories = [
    { key: "all", label: "All Photographs" },
    { key: "court", label: "Court Registry" },
    { key: "corporate", label: "Corporate Elegance" },
    { key: "casual", label: "Casual & Intimate" },
  ];

  if (images.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-gold/40 bg-white/60 p-16 text-center">
        <p className="font-display text-2xl text-burgundy">
          Ayọ̀ àti ìbùkún &mdash; Photos Coming Soon
        </p>
        <p className="mt-2 text-sm text-rich-black/60">
          The pre-wedding gallery will appear here once published.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Category Filter Tabs */}
      {enableFilters && (
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              type="button"
              className={`rounded-full px-5 py-2 text-xs font-semibold tracking-wider transition-all duration-300 ${
                selectedCategory === cat.key
                  ? "bg-burgundy text-champagne shadow-md shadow-burgundy/20"
                  : "bg-white/80 text-rich-black/70 hover:bg-champagne/60 hover:text-burgundy border border-rich-black/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Masonry / Editorial Grid */}
      <div className="columns-1 gap-4 sm:columns-2 md:columns-3 lg:columns-4 space-y-4">
        {filteredImages.map((img, i) => (
          <div
            key={String(img.id)}
            className="group relative break-inside-avoid overflow-hidden rounded-2xl border border-gold/20 bg-wine/10 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-burgundy/15 focus-within:ring-2 focus-within:ring-gold"
          >
            <button
              onClick={() => setIndex(i)}
              type="button"
              className="block w-full text-left focus:outline-none"
              aria-label={img.caption ?? img.altText ?? `Wedding photograph ${i + 1}`}
            >
              <div className="relative overflow-hidden bg-burgundy/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.imageUrl}
                  alt={img.altText ?? img.caption ?? "Pre-wedding celebration"}
                  loading="lazy"
                  className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Subtle Hover Gradient & Caption Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-wine/90 via-wine/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-4 text-champagne">
                  {img.caption && (
                    <p className="font-display text-sm font-medium line-clamp-2 drop-shadow">
                      {img.caption}
                    </p>
                  )}
                  <span className="mt-1 text-[10px] tracking-widest text-gold uppercase flex items-center gap-1">
                    <span>✦</span>
                    <span>Click to view in high resolution</span>
                  </span>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>

      {/* Fullscreen Lightbox Modal */}
      <AnimatePresence>
        {index !== null && filteredImages[index] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-rich-black/95 p-4 sm:p-6 backdrop-blur-md"
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
            {/* Top Toolbar */}
            <div
              className="flex w-full max-w-6xl items-center justify-between z-10 text-champagne/80"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                <span className="gold-text font-display text-lg tracking-widest">
                  DELOUS &rsquo;26
                </span>
                <span className="text-xs text-champagne/50">
                  &bull; {index + 1} of {filteredImages.length}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={filteredImages[index].imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-champagne/20 bg-wine/50 px-3 py-1.5 text-xs text-champagne/80 hover:border-gold hover:text-gold transition"
                  title="Open original image"
                >
                  ↗ Original
                </a>
                <button
                  aria-label="Close Lightbox"
                  onClick={close}
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-champagne/30 bg-wine/50 text-xl text-champagne hover:border-gold hover:bg-gold hover:text-wine transition"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Middle Image Display with Navigation Arrows */}
            <div className="relative flex flex-1 w-full max-w-6xl items-center justify-center my-3">
              {/* Prev Button */}
              <button
                aria-label="Previous photograph"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                type="button"
                className="absolute left-2 sm:left-4 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-wine/80 text-2xl text-gold shadow-lg backdrop-blur hover:bg-gold hover:text-wine transition"
              >
                &#8249;
              </button>

              <div
                className="relative max-h-[75vh] max-w-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.img
                  key={String(filteredImages[index].id)}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  src={filteredImages[index].imageUrl}
                  alt={
                    filteredImages[index].altText ??
                    filteredImages[index].caption ??
                    "Wedding photograph"
                  }
                  className="max-h-[75vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-gold/30"
                />
              </div>

              {/* Next Button */}
              <button
                aria-label="Next photograph"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                type="button"
                className="absolute right-2 sm:right-4 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-wine/80 text-2xl text-gold shadow-lg backdrop-blur hover:bg-gold hover:text-wine transition"
              >
                &#8250;
              </button>
            </div>

            {/* Bottom Caption & Thumbnails info */}
            <div
              className="w-full max-w-2xl text-center z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {filteredImages[index].caption && (
                <p className="font-display text-lg sm:text-xl italic text-champagne">
                  {filteredImages[index].caption}
                </p>
              )}
              <p className="mt-1 text-xs text-champagne/50">
                Use arrow keys ← → or swipe on mobile to navigate
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
