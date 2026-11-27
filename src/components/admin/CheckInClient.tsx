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
  UserAdd01Icon,
  ArrowTurnBackwardIcon,
  QrCodeIcon,
} from "@hugeicons/core-free-icons";
import { Modal, ConfirmModal } from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";
import { inputCls, labelCls, btnPrimary, btnSecondary, Badge } from "@/components/admin/ui";

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

const lagosTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("en-GB", {
    timeZone: "Africa/Lagos",
    hour: "2-digit",
    minute: "2-digit",
  });

function ScanResultCard({
  result,
  onNext,
}: {
  result: ScanResult;
  onNext: () => void;
}) {
  const config =
    result.status === "admitted"
      ? {
          bg: "bg-emerald-50/80 border-emerald-200/90",
          icon: CheckmarkCircle01Icon,
          iconColor: "text-emerald-600 bg-emerald-100/60",
          title: "Admitted — Welcome to DELOUS '26!",
        }
      : result.status === "already_checked_in"
        ? {
            bg: "bg-amber-50/80 border-amber-200/90",
            icon: Alert02Icon,
            iconColor: "text-amber-600 bg-amber-100/60",
            title: "Already Admitted / Checked In",
          }
        : result.status === "revoked"
          ? {
              bg: "bg-rose-50/80 border-rose-200/90",
              icon: CancelCircleIcon,
              iconColor: "text-rose-600 bg-rose-100/60",
              title: "Ticket Revoked — Do Not Admit",
            }
          : result.status === "invalid"
            ? {
                bg: "bg-rose-50/80 border-rose-200/90",
                icon: Cancel01Icon,
                iconColor: "text-rose-600 bg-rose-100/60",
                title: "Invalid Ticket QR Code",
              }
            : {
                bg: "bg-rose-50/80 border-rose-200/90",
                icon: Alert02Icon,
                iconColor: "text-rose-600 bg-rose-100/60",
                title: "Scan Processing Error",
              };

  const guest = "guest" in result ? result.guest : null;

  return (
    <div
      className={`rounded-2xl border p-6 text-center shadow-xs transition-all ${config.bg}`}
    >
      <div className="flex justify-center">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-2xl ${config.iconColor}`}
        >
          <HugeiconsIcon icon={config.icon} size={36} />
        </div>
      </div>
      <h3 className="mt-4 text-lg font-bold text-zinc-900 tracking-tight">
        {config.title}
      </h3>
      {guest && (
        <div className="mt-3.5 space-y-1">
          <p className="text-2xl font-bold text-zinc-900">{guest.fullName}</p>
          <p className="font-mono text-xs text-zinc-500 font-medium">
            {guest.attendeeCode ?? "No code"}
          </p>
          {guest.groupName && (
            <div className="pt-1.5">
              <span className="inline-block rounded-full bg-zinc-900 px-3 py-1 text-xs font-medium text-white shadow-xs">
                {guest.groupName}
              </span>
            </div>
          )}
          {"checkedInAt" in result && (
            <p className="mt-2 text-xs text-zinc-600 font-medium">
              Verified at: {lagosTime(result.checkedInAt)} (Lagos Time)
            </p>
          )}
          {result.status === "admitted" && (
            <p className="mt-3 text-xs font-semibold text-emerald-800">
              Please verify identity and provide wedding access wristband.
            </p>
          )}
        </div>
      )}
      {result.status === "error" && (
        <p className="mt-2 text-xs font-medium text-rose-700">{result.message}</p>
      )}
      <div className="mt-6">
        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 rounded-xl bg-burgundy px-7 py-3 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-wine transition focus:outline-none focus:ring-2 focus:ring-burgundy/20"
        >
          <HugeiconsIcon icon={Camera01Icon} size={16} />
          <span>Scan Next Guest</span>
        </button>
      </div>
    </div>
  );
}

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
  const { toast } = useToast();

  // Multi-device sync
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

  // Scanner
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
          message: "Network failure — guest not admitted. Please retry.",
        });
        await stopScanner();
      }
    },
    [refresh, stopScanner]
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
        () => {}
      );
      setScannerActive(true);
    } catch (err) {
      setScannerError(
        err instanceof Error && /permission/i.test(err.message)
          ? "Camera permission denied. Allow camera access in your browser settings, or use manual search."
          : "Could not initialize camera scanner. Use manual search instead."
      );
    }
  }, [handleDecoded]);

  useEffect(() => () => void stopScanner(), [stopScanner]);

  // Search
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
          { cache: "no-store" }
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
    const nowIso = new Date().toISOString();
    setResults((rs) =>
      rs.map((r) => (r.id === row.id ? { ...r, checkedInAt: nowIso } : r))
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
        toast({ type: "success", message: `${row.fullName} admitted successfully` });
      } else {
        setResults((rs) =>
          rs.map((r) =>
            r.id === row.id ? { ...r, checkedInAt: row.checkedInAt } : r
          )
        );
        setStats((s) => (s ? { ...s, checkedIn: Math.max(0, s.checkedIn - 1) } : s));
        if (json.status === "already_checked_in") {
          setResults((rs) =>
            rs.map((r) =>
              r.id === row.id ? { ...r, checkedInAt: json.checkedInAt } : r
            )
          );
          toast({ type: "info", message: `${row.fullName} is already checked in.` });
        } else if (json.status === "revoked") {
          toast({ type: "error", message: `${row.fullName}'s ticket is revoked — do not admit.` });
        } else {
          toast({ type: "error", message: json.error ?? "Check-in failed" });
        }
      }
      void refresh();
    } catch {
      setResults((rs) =>
        rs.map((r) =>
          r.id === row.id ? { ...r, checkedInAt: row.checkedInAt } : r
        )
      );
      setStats((s) => (s ? { ...s, checkedIn: Math.max(0, s.checkedIn - 1) } : s));
      toast({ type: "error", message: "Network error — check-in not recorded." });
    }
  }

  // Undo confirmation modal
  const [undoTarget, setUndoTarget] = useState<{ id: number; name: string } | null>(null);

  async function confirmUndo() {
    if (!undoTarget) return;
    const { id: guestId, name } = undoTarget;
    try {
      const res = await fetch("/api/admin/check-in/undo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId }),
      });
      if (res.ok) {
        toast({ type: "success", message: `${name} returned to awaiting check-in.` });
        setRecent((r) => r.filter((x) => x.guestId !== guestId));
        setStats((s) => (s ? { ...s, checkedIn: Math.max(0, s.checkedIn - 1) } : s));
      } else {
        const json = await res.json();
        toast({ type: "error", message: json.error ?? "Undo failed" });
      }
      void refresh();
    } catch {
      toast({ type: "error", message: "Network error — undo not recorded." });
    } finally {
      setUndoTarget(null);
    }
  }

  // On-spot registration modal
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
        toast({
          type: "success",
          message: `${osName} registered${osAuto ? " and checked in" : ""} (${json.attendeeCode})`,
        });
        setModalOpen(false);
        setOsName("");
        setOsPhone("");
        setOsGroup("");
        setOsAuto(true);
        void refresh();
      } else {
        toast({ type: "error", message: json.error ?? "Registration failed" });
      }
    } catch {
      toast({ type: "error", message: "Network error — could not register." });
    } finally {
      setOsBusy(false);
    }
  }

  const renderTabButton = (key: typeof tab, label: ReactNode) => (
    <button
      type="button"
      onClick={() => setTab(key)}
      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
        tab === key
          ? "bg-white text-zinc-900 shadow-xs"
          : "text-zinc-600 hover:text-zinc-900"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Live Entrance Header */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-wine p-6 text-champagne shadow-sm relative">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-burgundy/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-gold border border-gold/30">
              Live Checkpoint
            </div>
            <h2 className="mt-2 text-lg font-bold text-white tracking-tight">
              DELOUS &apos;26 Entrance Check-in
            </h2>
            <p className="mt-0.5 text-xs text-zinc-300">
              On duty: <span className="font-semibold text-white">{officerName}</span>
            </p>
          </div>

          <div className="rounded-xl border border-white/15 bg-black/25 px-5 py-3 text-right">
            <p className="text-3xl font-extrabold tracking-tight text-white font-mono">
              {stats ? `${stats.checkedIn} / ${stats.registered}` : "— / —"}
            </p>
            <p className="text-[11px] font-medium uppercase tracking-wider text-gold">
              Guests Admitted
            </p>
          </div>
        </div>
      </div>

      {/* Tabs and Walk-in Action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-zinc-200/60 p-1 border border-zinc-200/80">
          {renderTabButton(
            "scan",
            <>
              <HugeiconsIcon icon={Camera01Icon} size={15} />
              <span>Camera Scan</span>
            </>
          )}
          {renderTabButton(
            "search",
            <>
              <HugeiconsIcon icon={Search01Icon} size={15} />
              <span>Manual Search</span>
            </>
          )}
          {renderTabButton(
            "recent",
            <>
              <HugeiconsIcon icon={Clock01Icon} size={15} />
              <span>Recent Activity ({recent.length})</span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-gold/50 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-900 shadow-xs hover:bg-amber-100 transition"
        >
          <HugeiconsIcon icon={UserAdd01Icon} size={15} />
          <span>Walk-in Guest</span>
        </button>
      </div>

      {/* Scan Tab */}
      {tab === "scan" && (
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs">
          {scanResult ? (
            <ScanResultCard
              result={scanResult}
              onNext={() => void startScanner()}
            />
          ) : (
            <div className="space-y-4">
              <div
                id="qr-reader"
                className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-zinc-950 border border-zinc-800 shadow-inner [&_video]:w-full"
              />
              {!scannerActive && (
                <div className="py-8 text-center space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-burgundy/10 text-burgundy mx-auto">
                    <HugeiconsIcon icon={QrCodeIcon} size={24} />
                  </div>
                  {scannerError ? (
                    <div className="mx-auto max-w-sm rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                      {scannerError}
                    </div>
                  ) : (
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      Click below to activate the camera and present guest QR invitations.
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => void startScanner()}
                    className={btnPrimary}
                  >
                    <HugeiconsIcon icon={Camera01Icon} size={15} />
                    <span>Launch Camera Scanner</span>
                  </button>
                </div>
              )}
              {scannerActive && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-xs font-medium text-zinc-500">
                    Camera active — center guest QR pass inside the frame…
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Search Tab */}
      {tab === "search" && (
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs space-y-4">
          <div className="relative">
            <HugeiconsIcon
              icon={Search01Icon}
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by guest name, attendee ID, phone, or email…"
              className={`${inputCls} !pl-10 !py-2.5`}
            />
          </div>

          <div className="space-y-2.5">
            {query.trim().length < 2 ? (
              <p className="py-12 text-center text-xs text-zinc-400">
                Type at least 2 characters to search the guest roster.
              </p>
            ) : searching && results.length === 0 ? (
              <p className="py-12 text-center text-xs text-zinc-400">
                Searching guest records…
              </p>
            ) : results.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <p className="text-xs font-medium text-zinc-500">
                  No guest matches &ldquo;{query}&rdquo;.
                </p>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="text-xs font-semibold text-burgundy hover:underline"
                >
                  Register as approved walk-in guest →
                </button>
              </div>
            ) : (
              results.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-zinc-200/80 p-4 transition hover:border-zinc-300"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-zinc-900 truncate">
                        {r.fullName}
                      </p>
                      {r.groupName && (
                        <span className="rounded bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-700">
                          {r.groupName}
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-zinc-400 mt-0.5">
                      {r.attendeeCode ?? "No code"}
                      {r.phone ? ` · ${r.phone}` : ""}
                    </p>
                    {r.status === "revoked" ? (
                      <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-rose-600">
                        <HugeiconsIcon icon={CancelCircleIcon} size={14} />
                        <span>Revoked — do not admit</span>
                      </p>
                    ) : r.checkedInAt ? (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-emerald-700">
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />
                        <span>Checked in at {lagosTime(r.checkedInAt)}</span>
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] text-zinc-400 font-medium">
                        Awaiting entrance check-in
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    {r.status !== "revoked" && !r.checkedInAt && (
                      <button
                        type="button"
                        onClick={() => void manualCheckIn(r)}
                        className={btnPrimary}
                      >
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={15} />
                        <span>Check In Now</span>
                      </button>
                    )}
                    {r.checkedInAt && (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200/60">
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />
                        <span>Admitted</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Recent Tab */}
      {tab === "recent" && (
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-xs">
          {recent.length === 0 ? (
            <p className="py-12 text-center text-xs text-zinc-400">
              No recent check-ins recorded yet. Admitted guests will stream here live.
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {recent.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-semibold text-sm text-zinc-900">{r.fullName}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {lagosTime(r.checkedInAt)} ·{" "}
                      <span className="uppercase font-medium text-zinc-600">
                        {r.method === "qr" ? "QR Scan" : "Manual"}
                      </span>
                      {r.officer && ` · by ${r.officer}`}
                      {r.groupName && ` (${r.groupName})`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUndoTarget({ id: r.guestId, name: r.fullName })}
                    className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-50 hover:text-rose-600 transition"
                  >
                    <HugeiconsIcon icon={ArrowTurnBackwardIcon} size={13} />
                    <span>Undo</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Walk-in Registration Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Register Approved Walk-in Guest"
        description="For last-minute VIP guests or approved walk-ins at the checkpoint."
        maxWidth="md"
      >
        <form onSubmit={registerOnSpot} className="space-y-4">
          <div>
            <label className={labelCls}>Full Name *</label>
            <input
              value={osName}
              onChange={(e) => setOsName(e.target.value)}
              required
              minLength={2}
              placeholder="e.g. Chief Adeleke"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Phone Number (Optional)</label>
            <input
              value={osPhone}
              onChange={(e) => setOsPhone(e.target.value)}
              placeholder="+234..."
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Invitation Group</label>
            <select
              value={osGroup}
              onChange={(e) => setOsGroup(e.target.value)}
              className={inputCls}
            >
              <option value="">Unassigned</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2.5 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs font-medium text-zinc-800">
            <input
              type="checkbox"
              checked={osAuto}
              onChange={(e) => setOsAuto(e.target.checked)}
              className="h-4 w-4 rounded accent-[#541323]"
            />
            <span>Check in immediately upon registration</span>
          </label>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className={btnSecondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={osBusy}
              className={btnPrimary}
            >
              {osBusy ? "Registering..." : "Register & Admit"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reversible check-in confirmation modal */}
      {undoTarget && (
        <ConfirmModal
          open={!!undoTarget}
          onClose={() => setUndoTarget(null)}
          onConfirm={() => void confirmUndo()}
          title="Reverse Admission"
          message={`Reverse check-in status for ${undoTarget.name}? This will return them to pending check-in status.`}
          confirmLabel="Reverse Check-in"
          variant="warning"
        />
      )}
    </div>
  );
}
