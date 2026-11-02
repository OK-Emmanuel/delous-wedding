"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const inputCls =
  "w-full rounded-xl border border-gold/40 bg-white px-4 py-3 text-sm text-rich-black placeholder:text-rich-black/35 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";

export default function RecoveryForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/tickets/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Something went wrong");
        return;
      }
      setMessage(json.message);
      setStep(2);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/tickets/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, code }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Invalid or expired code");
        return;
      }
      router.push(json.url);
    } catch {
      setError("Network error — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-gold/30 bg-white p-7 shadow-xl shadow-gold/5 md:p-10"
    >
      {step === 1 ? (
        <form onSubmit={requestCode} className="space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-burgundy">
              Registered email or phone number
            </label>
            <input
              className={inputCls}
              placeholder="you@example.com or 0803 123 4567"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            disabled={busy}
            className="w-full rounded-full bg-burgundy py-3.5 font-medium text-champagne transition hover:bg-wine disabled:opacity-60"
          >
            {busy ? "Sending…" : "Send Verification Code"}
          </button>
        </form>
      ) : (
        <form onSubmit={verifyCode} className="space-y-5">
          {message && (
            <p className="rounded-lg bg-champagne/50 p-3 text-xs text-burgundy">{message}</p>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-burgundy">
              Enter the 6-digit code
            </label>
            <input
              className={`${inputCls} text-center font-mono text-xl tracking-[0.5em]`}
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            disabled={busy || code.length !== 6}
            className="w-full rounded-full bg-burgundy py-3.5 font-medium text-champagne transition hover:bg-wine disabled:opacity-60"
          >
            {busy ? "Verifying…" : "View My Invitation"}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setError(null);
            }}
            className="w-full text-center text-xs text-rich-black/50 underline underline-offset-2"
          >
            Use a different email or phone
          </button>
        </form>
      )}
    </motion.div>
  );
}
