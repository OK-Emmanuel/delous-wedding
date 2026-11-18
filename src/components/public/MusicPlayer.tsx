"use client";

import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { VolumeMute01Icon, VolumeHighIcon } from "@hugeicons/core-free-icons";

const AUDIO_SRC = "/audio/delous.mp3"; // supply the licensed track here
const PREF_KEY = "delous-music-pref";

/**
 * Optional guest-controlled background music (PRD §3.5).
 * Scaffolded to work as soon as /public/audio/delous.mp3 is provided;
 * hides itself gracefully if the track is missing.
 */
export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [available, setAvailable] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.6);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREF_KEY);
      if (raw) {
        const pref = JSON.parse(raw) as { muted: boolean; volume: number };
        setMuted(pref.muted);
        setVolume(pref.volume);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PREF_KEY, JSON.stringify({ muted, volume }));
    } catch {}
    if (audioRef.current) {
      audioRef.current.muted = muted;
      audioRef.current.volume = volume;
    }
  }, [muted, volume]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        // Autoplay restrictions or missing file
      }
    }
  };

  if (!available) return null;

  return (
    <div className="no-print fixed bottom-5 right-5 z-40 flex items-center gap-2">
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        loop
        preload="none"
        autoPlay
        onError={() => setAvailable(false)}
      />
      {expanded && (
        <div className="flex items-center gap-2 rounded-full bg-wine/90 px-4 py-2 shadow-lg backdrop-blur">
          <button
            aria-label={muted ? "Unmute" : "Mute"}
            onClick={() => setMuted((m) => !m)}
            className="flex items-center text-champagne/90 hover:text-gold transition"
          >
            {muted ? (
              <HugeiconsIcon icon={VolumeMute01Icon} size={18} />
            ) : (
              <HugeiconsIcon icon={VolumeHighIcon} size={18} />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            aria-label="Volume"
            onChange={(e) => setVolume(Number(e.target.value))}
            className="h-1 w-24 accent-[#C6A15B]"
          />
        </div>
      )}
      <button
        onClick={() => {
          setExpanded(true);
          void toggle();
        }}
        aria-label={playing ? "Pause music" : "Play music"}
        className="flex h-12 w-12 items-center justify-center rounded-full border border-gold bg-burgundy text-gold shadow-lg transition hover:scale-105"
      >
        {playing ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}
