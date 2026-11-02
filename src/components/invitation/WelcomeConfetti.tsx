"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Piece = {
  id: number;
  x: number;
  delay: number;
  duration: number;
  char: string;
  size: number;
};

/** Celebratory reveal when a fresh registration lands on the ticket. */
export default function WelcomeConfetti() {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    const chars = ["✦", "❖", "✧", "•"];
    setPieces(
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 1.2,
        duration: 3 + Math.random() * 2.5,
        char: chars[i % chars.length],
        size: 12 + Math.random() * 14,
      })),
    );
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: "105vh", opacity: [0, 1, 1, 0], rotate: 360 }}
          transition={{ duration: p.duration, delay: p.delay, ease: "linear" }}
          className="absolute text-gold"
          style={{ left: `${p.x}%`, fontSize: p.size }}
        >
          {p.char}
        </motion.span>
      ))}
    </div>
  );
}
