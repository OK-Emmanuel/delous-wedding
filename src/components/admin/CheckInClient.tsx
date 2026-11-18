"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Html5Qrcode } from "html5-qrcode";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Camera01Icon,
  Search01Icon,
  Clock01Icon,
  CheckmarkCircle01Icon,
  Alert02Icon,
  CancelCircleIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

type Stats = { total: number; registered: number; checkedIn: number };
type ScanGuest = {
  id: number;
  attendeeCode: string | null;
  fullName: string;
  groupName: string | null;
  registrationStatus: string;
};
type ScanResult =
  | { status: "admitted"; guest: ScanGuest; checkedInAt: string }
  | { status: "already_checked_in"; guest: ScanGuest; checkedInAt: string }
  | { status: "revoked"; guest: ScanGuest | null }
  | { status: "invalid" }
  | { status: "error"; message: string };

type SearchRow = {
  id: number;
  attendeeCode: string | null;
  fullName: string;
  email: string | null;
  phone: string | null;
  status: string;
  groupName: string | null;
  checkedInAt: string | null;
  hasActiveTicket: boolean;
};

type Recent = {
  id: number;
  guestId: number;
  fullName: string;
  attendeeCode: string | null;
  groupName: string | null;
  officer: string | null;
  method: string;
  checkedInAt: string;
};

type Toast = { id: number; kind: "success" | "error" | "info"; text: string };

const lagosTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", {
    timeZone: "Africa/Lagos",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function CheckInClient({
  groups,
  officerName,
}: {
  groups: Array<{ id: number; name: string }>;
  officerName: string;
}) {
  const [tab, setTab] = useState<"scan" | "search" | "recent">("scan");
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Recent[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const toast = useCallback((kind: Toast["kind"], text: string) => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  // --- Multi-device sync: poll stats + recent every 10 seconds -----------
  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/check-in/stats", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      setStats(json.stats);
      setRecent(json.recent);
    } catch {
      /* network blip — keep last known state */
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => void refresh(), 10_000);
    return () => clearInterval(id);
  }, [refresh]);

  // --- Scanner ------------------------------------------------------------
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanLock = useRef(false);
  const [scannerActive, setScannerActive] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    setScannerActive(false);
    if (scanner) {
      try {
        await scanner.stop();
        scanner.clear();
      } catch {}
    }
  }, []);

  const handleDecoded = useCallback(
    async (payload: string) => {
      if (scanLock.current) return;
      scanLock.current = true;
      try {
        const res = await fetch("/api/admin/check-in/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ payload }),
        });
        const json = await res.json();
        if (!res.ok) {
          setScanResult({ status: "error", message: json.error ?? "Scan failed" });
        } else {
          setScanResult(json as ScanResult);
          if (json.status === "admitted") {
            setStats((s) => (s ? { ...s, checkedIn: s.checkedIn + 1 } : s));
          }
        }
        await stopScanner();
        void refresh();
      } catch {
        setScanResult({
          status: "error",
          message: "Network failure — the guest was NOT admitted. Try again.",
        });
        await stopScanner();
      }
    },
    [refresh, stopScanner],
  );

  const startScanner = useCallback(async () => {
    setScanResult(null);
    setScannerError(null);
    scanLock.current = false;
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => void handleDecoded(decoded),
        () => {},
      );
      setScannerActive(true);
    } catch (err) {
      setScannerError(
        err instanceof Error && /permission/i.test(err.message)
          ? "Camera permission denied. Allow camera access in your browser settings, or use manual search."
          : "Could not start the camera. Use manual search instead.",
      );
    }
  }, [handleDecoded]);

  useEffect(() => () => void stopScanner(), [stopScanner]);

  // --- Manual search (lifted from tosin-wedding frontdoor) ----------------
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchRow[]>([]);
  const [searching, setSearching] = useState(false);
  const searchSeq = useRef(0);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const seq = ++searchSeq.current;
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/admin/check-in/search?q=${encodeURIComponent(query.trim())}`,
          { cache: "no-store" },
        );
        const json = await res.json();
        if (seq === searchSeq.current) setResults(json.results ?? []);
      } catch {
        if (seq === searchSeq.current) setResults([]);
      } finally {
        if (seq === searchSeq.current) setSearching(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  async function manualCheckIn(row: SearchRow) {
    // Optimistic update with rollback (tosin-wedding pattern)
    const nowIso = new Date().toISOString();
    setResults((rs) =>
      rs.map((r) => (r.id === row.id ? { ...r, checkedInAt: nowIso } : r)),
    );
    setStats((s) => (s ? { ...s, checkedIn: s.checkedIn + 1 } : s));
    try {
      const res = await fetch("/api/admin/check-in/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId: row.id }),
      });
      const json = await res.json();
      if (json.status === "admitted") {
        toast("success", `${row.fullName} checked in successfully`);
      } else {
        // rollback optimistic state
        setResults((rs) =>
          rs.map((r) =>
            r.id === row.id ? { ...r, checkedInAt: row.checkedInAt } : r,
          ),
        );
        setStats((s) => (s ? { ...s, checkedIn: Math.max(0, s.checkedIn - 1) } : s));
        if (json.status === "already_checked_in") {
          setResults((rs) =>
            rs.map((r) =>
              r.id === row.id ? { ...r, checkedInAt: json.checkedInAt } : r,
            ),
          );
          toast("info", `${row.fullName} is already checked in.`);
        } else if (json.status === "revoked") {
          toast("error", `${row.fullName}'s ticket is revoked — do not admit.`);
        } else {
          toast("error", json.error ?? "Check-in failed");
        }
      }
      void refresh();
    } catch {
      setResults((rs) =>
        rs.map((r) =>
          r.id === row.id ? { ...r, checkedInAt: row.checkedInAt } : r,
        ),
      );
      setStats((s) => (s ? { ...s, checkedIn: Math.max(0, s.checkedIn - 1) } : s));
      toast("error", "Network error — check-in not recorded.");
    }
  }

  async function undo(guestId: number, name: string) {
    if (!window.confirm(`Reverse check-in for ${name}?`)) return;
    try {
      const res = await fetch("/api/admin/check-in/undo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId }),
      });
      if (res.ok) {
        toast("success", `${name} returned to awaiting.`);
        setRecent((r) => r.filter((x) => x.guestId !== guestId));
        setStats((s) => (s ? { ...s, checkedIn: Math.max(0, s.checkedIn - 1) } : s));
      } else {
        const json = await res.json();
        toast("error", json.error ?? "Undo failed");
      }
      void refresh();
    } catch {
      toast("error", "Network error — undo not recorded.");
    }
  }

  // --- On-spot registration modal -----------------------------------------
  const [modalOpen, setModalOpen] = useState(false);
  const [osName, setOsName] = useState("");
  const [osPhone, setOsPhone] = useState("");
  const [osGroup, setOsGroup] = useState("");
  const [osAuto, setOsAuto] = useState(true);
  const [osBusy, setOsBusy] = useState(false);

  async function registerOnSpot(e: React.FormEvent) {
    e.preventDefault();
    setOsBusy(true);
    try {
      const res = await fetch("/api/admin/check-in/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: osName,
          phone: osPhone || undefined,
          groupId: osGroup ? Number(osGroup) : null,
          autoCheckIn: osAuto,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        toast(
          "success",
          `${osName} registered${osAuto ? " and checked in" : ""} (${json.attendeeCode})`,
        );
        setModalOpen(false);
        setOsName("");
        setOsPhone("");
        setOsGroup("");
        setOsAuto(true);
        void refresh();
      } else {
        toast("error", json.error ?? "Registration failed");
      }
    } catch {
      toast("error", "Network error — not registered.");
    } finally {
      setOsBusy(false);
    }
  }

  const tabBtn = (key: typeof tab, label: ReactNode) => (
    <button
      onClick={() => setTab(key)}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
        tab === key
          ? "bg-burgundy text-white"
          : "bg-white text-slate-600 hover:bg-slate-100"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-3xl">
      {/* Live counter header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-wine p-5 text-champagne">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gold">
            Unified Entrance Check-in
          </p>
          <p className="mt-1 text-sm text-champagne/70">Officer: {officerName}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-4xl font-semibold">
            {stats ? `${stats.checkedIn} / ${stats.registered}` : "— / —"}
          </p>
          <p className="text-xs text-champagne/70">guests admitted</p>
        </div>
      </div>

      {/* Tabs + on-spot */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {tabBtn("scan", <span className="inline-flex items-center gap-1.5"><HugeiconsIcon icon={Camera01Icon} size={16} /><span>Scan QR</span></span>)}
        {tabBtn("search", <span className="inline-flex items-center gap-1.5"><HugeiconsIcon icon={Search01Icon} size={16} /><span>Manual Search</span></span>)}
        {tabBtn("recent", <span className="inline-flex items-center gap-1.5"><HugeiconsIcon icon={Clock01Icon} size={16} /><span>Recent ({recent.length})</span></span>)}
        <button
          onClick={() => setModalOpen(true)}
          className="ml-auto rounded-lg border border-gold bg-gold/10 px-4 py-2 text-sm font-medium text-amber-800 transition hover:bg-gold/30"
        >
          + Register on Spot
        </button>
      </div>

      {/* ---- Scan tab ---- */}
      {tab === "scan" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {scanResult ? (
            <ScanResultCard
              result={scanResult}
              onNext={() => void startScanner()}
            />
          ) : (
            <>
              <div
                id="qr-reader"
                className="mx-auto w-full max-w-sm overflow-hidden rounded-xl bg-slate-900 [&_video]:w-full"
              />
              {!scannerActive && (
                <div className="py-8 text-center">
                  {scannerError ? (
                    <p className="mx-auto mb-4 max-w-sm rounded-lg bg-red-50 p-3 text-sm text-red-700">
                      {scannerError}
                    </p>
                  ) : (
                    <p className="mb-4 text-sm text-slate-500">
                      Start the camera and ask the guest to present their QR
                      invitation.
                    </p>
                  )}
                  <button
                    onClick={() => void startScanner()}
                    className="rounded-full bg-burgundy px-8 py-3 text-sm font-medium text-white transition hover:bg-wine"
                  >
                    Start Camera Scanner
                  </button>
                </div>
              )}
              {scannerActive && (
                <p className="mt-3 text-center text-xs text-slate-500">
                  Point the camera at the guest&rsquo;s QR code…
                </p>
              )}
            </>
          )}
        </div>
      )}

      {/* ---- Search tab ---- */}
      {tab === "search" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a name, attendee ID, phone or email…"
            className="w-full rounded-xl border border-slate-300 px-4 py-3.5 text-base focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20"
          />
          <div className="mt-4 space-y-2">
            {query.trim().length < 2 ? (
              <p className="py-10 text-center text-sm text-slate-400">
                Start typing to find a guest — the top 10 matches appear
                instantly.
              </p>
            ) : searching && results.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">Searching…</p>
            ) : results.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">
                No attendee matches &ldquo;{query}&rdquo;. Check the spelling or
                register them on the spot.
              </p>
            ) : (
              results.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-slate-900">
                      {r.fullName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {r.attendeeCode}
                      {r.groupName && (
                        <span className="ml-2 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          {r.groupName}
                        </span>
                      )}
                    </p>
                    {r.status === "revoked" ? (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600">
                        <HugeiconsIcon icon={CancelCircleIcon} size={14} />
                        <span>Revoked — do not admit</span>
                      </p>
                    ) : r.checkedInAt ? (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />
                        <span>Checked in at {lagosTime(r.checkedInAt)}</span>
                      </p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-400">Awaiting check-in</p>
                    )}
                  </div>
                  {r.status !== "revoked" && !r.checkedInAt && (
                    <button
                      onClick={() => void manualCheckIn(r)}
                      className="shrink-0 rounded-full bg-burgundy px-5 py-2.5 text-sm font-medium text-white transition hover:bg-wine"
                    >
                      Check In Now
                    </button>
                  )}
                  {r.checkedInAt && (
                    <button
                      disabled
                      className="shrink-0 rounded-full bg-slate-200 px-5 py-2.5 text-sm font-medium text-slate-500"
                    >
                      Checked In
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ---- Recent tab ---- */}
      {tab === "recent" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          {recent.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">
              No check-ins yet — they will stream in here live.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium text-slate-900">{r.fullName}</p>
                    <p className="text-xs text-slate-500">
                      {lagosTime(r.checkedInAt)} · {r.method === "qr" ? "QR scan" : "manual"}
                      {r.officer && ` · by ${r.officer}`}
                    </p>
                  </div>
                  <button
                    onClick={() => void undo(r.guestId, r.fullName)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    Undo
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* ---- On-spot modal ---- */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={() => setModalOpen(false)}
        >
          <form
            onSubmit={registerOnSpot}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <h2 className="text-lg font-semibold text-slate-900">Register on Spot</h2>
            <p className="mt-1 text-xs text-slate-500">
              For approved walk-ins and last-minute VIP guests only.
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Full name *
                </label>
                <input
                  value={osName}
                  onChange={(e) => setOsName(e.target.value)}
                  required
                  minLength={2}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-burgundy focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Phone (optional)
                </label>
                <input
                  value={osPhone}
                  onChange={(e) => setOsPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-burgundy focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Invitation group
                </label>
                <select
                  value={osGroup}
                  onChange={(e) => setOsGroup(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-burgundy focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={osAuto}
                  onChange={(e) => setOsAuto(e.target.checked)}
                  className="h-4 w-4 accent-[#541323]"
                />
                Check in immediately
              </label>
            </div>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 rounded-lg border border-slate-300 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                disabled={osBusy}
                className="flex-1 rounded-lg bg-burgundy py-2.5 text-sm font-medium text-white hover:bg-wine disabled:opacity-60"
              >
                {osBusy ? "Saving…" : "Register Guest"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ---- Toasts ---- */}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
              t.kind === "success"
                ? "bg-emerald-600"
                : t.kind === "error"
                  ? "bg-red-600"
                  : "bg-slate-700"
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function ScanResultCard({
  result,
  onNext,
}: {
  result: ScanResult;
  onNext: () => void;
}) {
  const config =
    result.status === "admitted"
      ? { bg: "bg-emerald-50 border-emerald-200", icon: CheckmarkCircle01Icon, iconColor: "text-emerald-600", title: "Admitted — welcome!" }
      : result.status === "already_checked_in"
        ? { bg: "bg-amber-50 border-amber-200", icon: Alert02Icon, iconColor: "text-amber-600", title: "Already checked in" }
        : result.status === "revoked"
          ? { bg: "bg-red-50 border-red-200", icon: CancelCircleIcon, iconColor: "text-red-600", title: "Ticket revoked — do not admit" }
          : result.status === "invalid"
            ? { bg: "bg-red-50 border-red-200", icon: Cancel01Icon, iconColor: "text-red-600", title: "Invalid ticket" }
            : { bg: "bg-red-50 border-red-200", icon: Alert02Icon, iconColor: "text-red-600", title: "Scan error" };

  const guest = "guest" in result ? result.guest : null;

  return (
    <div className={`rounded-xl border p-6 text-center ${config.bg}`}>
      <div className={`flex justify-center ${config.iconColor}`}>
        <HugeiconsIcon icon={config.icon} size={48} />
      </div>
      <h3 className="mt-3 text-xl font-semibold text-slate-900">{config.title}</h3>
      {guest && (
        <div className="mt-3">
          <p className="text-2xl font-semibold text-slate-900">{guest.fullName}</p>
          <p className="text-sm text-slate-500">{guest.attendeeCode}</p>
          {guest.groupName && (
            <span className="mt-2 inline-block rounded bg-slate-800 px-2 py-0.5 text-xs font-medium text-white">
              {guest.groupName}
            </span>
          )}
          {"checkedInAt" in result && (
            <p className="mt-2 text-xs text-slate-500">
              Check-in time: {lagosTime(result.checkedInAt)}
            </p>
          )}
          {result.status === "admitted" && (
            <p className="mt-3 text-sm font-medium text-emerald-700">
              Verify the guest&rsquo;s name before letting them through.
            </p>
          )}
        </div>
      )}
      {result.status === "error" && (
        <p className="mt-2 text-sm text-red-700">{result.message}</p>
      )}
      <button
        onClick={onNext}
        className="mt-6 rounded-full bg-burgundy px-8 py-3 text-sm font-medium text-white transition hover:bg-wine"
      >
        Scan Next Guest
      </button>
    </div>
  );
}
