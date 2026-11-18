"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Location01Icon,
  Calendar03Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";

interface ScratchCardProps {
  title: string;
  icon: ReactNode;
  subtitle: string;
  time: string;
  venue: string;
  address: string;
  highlights: string[];
  calendarLink?: string;
  mapLink?: string;
  isAllRevealed?: boolean;
}

export default function ScratchCard({
  title,
  icon,
  subtitle,
  time,
  venue,
  address,
  highlights,
  calendarLink,
  mapLink,
  isAllRevealed = false,
}: ScratchCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);

  // Synchronize with external "reveal all" toggle
  useEffect(() => {
    if (isAllRevealed && !isRevealed) {
      requestAnimationFrame(() => {
        setIsRevealed(true);
      });
    }
  }, [isAllRevealed, isRevealed]);

  // Draw gold foil scratch surface
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    if (width === 0 || height === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    // Deep burgundy & champagne metallic surface
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#2c0915");
    gradient.addColorStop(0.35, "#541323");
    gradient.addColorStop(0.7, "#3a0c18");
    gradient.addColorStop(1, "#1c050d");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Gold pattern grid overlay
    ctx.strokeStyle = "rgba(198, 161, 91, 0.18)";
    ctx.lineWidth = 1;
    const gridSize = 28;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Gold border frame
    ctx.strokeStyle = "rgba(198, 161, 91, 0.6)";
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, width - 24, height - 24);

    // Inner filigree corners
    ctx.strokeStyle = "rgba(198, 161, 91, 0.4)";
    ctx.strokeRect(18, 18, width - 36, height - 36);

    // Center emblem & instructions
    ctx.fillStyle = "#c6a15b";
    ctx.font = "italic 22px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦ DELOUS '26 ✦", width / 2, height / 2 - 38);

    ctx.fillStyle = "#f2e7d4";
    ctx.font = "600 13px sans-serif";
    ctx.letterSpacing = "3px";
    ctx.fillText("SCRATCH OR SWIPE TO REVEAL", width / 2, height / 2 + 6);

    ctx.fillStyle = "rgba(242, 231, 212, 0.75)";
    ctx.font = "italic 13px serif";
    ctx.fillText(title, width / 2, height / 2 + 34);

    ctx.fillStyle = "#c6a15b";
    ctx.font = "11px sans-serif";
    ctx.fillText("✦ Scratch with finger or mouse ✦", width / 2, height / 2 + 62);
  }, [title]);

  useEffect(() => {
    initCanvas();
    const handleResize = () => {
      if (!isRevealed) {
        initCanvas();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [initCanvas, isRevealed]);

  // Scratch action
  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const x = (clientX - rect.left) * dpr;
    const y = (clientY - rect.top) * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 32 * dpr, 0, Math.PI * 2);
    ctx.fill();

    // Check cleared percentage periodically
    if (Math.random() < 0.25) {
      checkClearedPercentage();
    }
  };

  const checkClearedPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas || isRevealed) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    try {
      const { width, height } = canvas;
      const sampleStep = 18;
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      let transparentPixels = 0;
      let totalSampled = 0;

      for (let y = 0; y < height; y += sampleStep) {
        for (let x = 0; x < width; x += sampleStep) {
          const idx = (y * width + x) * 4 + 3;
          if (data[idx] < 128) {
            transparentPixels++;
          }
          totalSampled++;
        }
      }

      const percent = Math.round((transparentPixels / totalSampled) * 100);
      setScratchProgress(percent);

      if (percent >= 35) {
        setIsRevealed(true);
      }
    } catch {
      // Ignore canvas errors
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isDrawingRef.current = true;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    scratch(e.clientX, e.clientY);
  };

  const handlePointerUp = () => {
    isDrawingRef.current = false;
  };

  const handleManualReveal = () => {
    setIsRevealed(true);
  };

  const handleReset = () => {
    setIsRevealed(false);
    setScratchProgress(0);
    setTimeout(() => {
      initCanvas();
    }, 50);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col min-h-[440px] rounded-3xl border border-gold/40 bg-gradient-to-br from-wine/90 via-[#20060e]/90 to-[#140308]/90 p-7 sm:p-9 text-champagne shadow-2xl shadow-burgundy/50 overflow-hidden backdrop-blur-md"
    >
      {/* Background card content */}
      <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gold/20 pb-4">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gold/40 bg-gold/15 text-gold shadow-inner">
                {icon}
              </span>
              <div>
                <span className="text-[10px] uppercase tracking-[0.3em] text-gold">
                  {subtitle}
                </span>
                <h3 className="font-display text-2xl sm:text-3xl font-medium text-champagne">
                  {title}
                </h3>
              </div>
            </div>
            <span className="rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs font-semibold text-gold">
              {time}
            </span>
          </div>

          {/* Venue & Location Details */}
          <div className="mt-6 space-y-2 rounded-2xl border border-gold/25 bg-wine/60 p-5 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.25em] text-gold/80">
              Venue &amp; Location
            </p>
            <h4 className="font-display text-xl sm:text-2xl font-semibold text-champagne">
              {venue}
            </h4>
            <p className="text-sm text-champagne/75 leading-relaxed">
              {address}
            </p>
          </div>

          {/* Event Highlights */}
          <div className="mt-5">
            <p className="text-[11px] uppercase tracking-[0.25em] text-gold/80 mb-3">
              Event Highlights
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-champagne/80">
              {highlights.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-gold">✦</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gold/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {mapLink && (
              <a
                href={mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/15 px-4 py-2 text-xs font-medium text-gold transition hover:bg-gold hover:text-wine"
              >
                <HugeiconsIcon icon={Location01Icon} size={15} />
                <span>Get Directions</span>
              </a>
            )}
            {calendarLink && (
              <a
                href={calendarLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-champagne/30 px-4 py-2 text-xs font-medium text-champagne/80 transition hover:border-gold hover:text-gold"
              >
                <HugeiconsIcon icon={Calendar03Icon} size={15} />
                <span>Add to Calendar</span>
              </a>
            )}
          </div>

          {isRevealed && (
            <button
              onClick={handleReset}
              type="button"
              className="text-[11px] uppercase tracking-wider text-champagne/50 hover:text-gold transition"
            >
              Scratch Again ↺
            </button>
          )}
        </div>
      </div>

      {/* Interactive Canvas Scratch Layer */}
      <motion.div
        initial={false}
        animate={{
          opacity: isRevealed ? 0 : 1,
          pointerEvents: isRevealed ? "none" : "auto",
        }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute inset-0 z-20"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="touch-none w-full h-full cursor-crosshair"
          aria-label="Scratch card surface"
        />

        {/* Quick reveal button */}
        <div className="absolute bottom-5 inset-x-0 flex flex-col items-center gap-2 pointer-events-auto">
          {scratchProgress > 0 && scratchProgress < 35 && (
            <div className="h-1.5 w-32 rounded-full bg-wine/80 overflow-hidden border border-gold/40">
              <div
                className="h-full bg-gold transition-all duration-200"
                style={{ width: `${(scratchProgress / 35) * 100}%` }}
              />
            </div>
          )}
          <button
            onClick={handleManualReveal}
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full border border-gold/60 bg-wine/90 px-5 py-2 text-xs tracking-wider text-gold shadow-lg backdrop-blur hover:bg-gold hover:text-wine transition"
          >
            <HugeiconsIcon icon={SparklesIcon} size={13} />
            <span>Click to Reveal Details</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
