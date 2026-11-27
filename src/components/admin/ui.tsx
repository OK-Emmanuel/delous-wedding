import Link from "next/link";
import type { ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Analytics01Icon,
  CheckmarkCircle01Icon,
  Alert02Icon,
  Clock01Icon,
  HelpCircleIcon,
  File01Icon,
} from "@hugeicons/core-free-icons";

export function StatCard({
  label,
  value,
  hint,
  accent = "burgundy",
}: {
  label: string;
  value: string | number;
  hint?: string;
  accent?: "burgundy" | "gold" | "emerald" | "slate";
}) {
  const accentConfigs = {
    burgundy: {
      dot: "bg-burgundy",
      badge: "bg-burgundy/5 text-burgundy border-burgundy/15",
      icon: Analytics01Icon,
    },
    gold: {
      dot: "bg-gold",
      badge: "bg-amber-50 text-amber-800 border-amber-200/60",
      icon: Clock01Icon,
    },
    emerald: {
      dot: "bg-emerald-600",
      badge: "bg-emerald-50 text-emerald-800 border-emerald-200/60",
      icon: CheckmarkCircle01Icon,
    },
    slate: {
      dot: "bg-zinc-400",
      badge: "bg-zinc-100 text-zinc-700 border-zinc-200/80",
      icon: Alert02Icon,
    },
  };

  const config = accentConfigs[accent];
  const IconComponent = config.icon;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-zinc-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:border-zinc-300 hover:shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
          {label}
        </span>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg border ${config.badge} transition-transform group-hover:scale-105`}
        >
          <HugeiconsIcon icon={IconComponent} size={15} />
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <p className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
          {value}
        </p>
      </div>
      {hint && (
        <p className="mt-2 text-xs font-normal text-zinc-500 flex items-center gap-1.5 truncate">
          <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${config.dot}`} />
          <span className="truncate">{hint}</span>
        </p>
      )}
    </div>
  );
}

const badgeThemes: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  // Positive / Confirmed
  confirmed: { bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-500", border: "border-emerald-200/60" },
  active: { bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-500", border: "border-emerald-200/60" },
  delivered: { bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-500", border: "border-emerald-200/60" },
  published: { bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-500", border: "border-emerald-200/60" },
  checked_in: { bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-500", border: "border-emerald-200/60" },
  definitely: { bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-500", border: "border-emerald-200/60" },

  // Informative / Processing
  registered: { bg: "bg-blue-50", text: "text-blue-800", dot: "bg-blue-500", border: "border-blue-200/60" },
  likely: { bg: "bg-blue-50", text: "text-blue-800", dot: "bg-blue-500", border: "border-blue-200/60" },
  sent: { bg: "bg-blue-50", text: "text-blue-800", dot: "bg-blue-500", border: "border-blue-200/60" },
  qr: { bg: "bg-purple-50", text: "text-purple-800", dot: "bg-purple-500", border: "border-purple-200/60" },

  // Pending / Caution
  pending: { bg: "bg-amber-50", text: "text-amber-800", dot: "bg-amber-500", border: "border-amber-200/60" },
  unsure: { bg: "bg-amber-50", text: "text-amber-800", dot: "bg-amber-500", border: "border-amber-200/60" },
  draft: { bg: "bg-amber-50", text: "text-amber-800", dot: "bg-amber-500", border: "border-amber-200/60" },
  manual: { bg: "bg-amber-50", text: "text-amber-800", dot: "bg-amber-500", border: "border-amber-200/60" },

  // Danger / Negative
  revoked: { bg: "bg-rose-50", text: "text-rose-800", dot: "bg-rose-500", border: "border-rose-200/60" },
  declined: { bg: "bg-rose-50", text: "text-rose-800", dot: "bg-rose-500", border: "border-rose-200/60" },
  failed: { bg: "bg-rose-50", text: "text-rose-800", dot: "bg-rose-500", border: "border-rose-200/60" },
  bounced: { bg: "bg-rose-50", text: "text-rose-800", dot: "bg-rose-500", border: "border-rose-200/60" },

  // Neutral
  preloaded: { bg: "bg-zinc-100", text: "text-zinc-700", dot: "bg-zinc-400", border: "border-zinc-200/80" },
  archived: { bg: "bg-zinc-100", text: "text-zinc-700", dot: "bg-zinc-400", border: "border-zinc-200/80" },
  hidden: { bg: "bg-zinc-100", text: "text-zinc-700", dot: "bg-zinc-400", border: "border-zinc-200/80" },

  // Roles
  super_admin: { bg: "bg-burgundy/10", text: "text-burgundy", dot: "bg-burgundy", border: "border-burgundy/20" },
  admin: { bg: "bg-zinc-100", text: "text-zinc-800", dot: "bg-zinc-600", border: "border-zinc-200/80" },
  checkin_officer: { bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-600", border: "border-emerald-200/60" },
  content_manager: { bg: "bg-amber-50", text: "text-amber-800", dot: "bg-amber-600", border: "border-amber-200/60" },
};

export function Badge({
  value,
  label,
}: {
  value: string;
  label?: string;
}) {
  const theme =
    badgeThemes[value] ?? {
      bg: "bg-zinc-100",
      text: "text-zinc-700",
      dot: "bg-zinc-400",
      border: "border-zinc-200/80",
    };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize tracking-tight ${theme.bg} ${theme.text} ${theme.border}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
      <span>{label ?? value.replace(/_/g, " ")}</span>
    </span>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
          {title}
        </h1>
        {description && (
          <p className="text-xs sm:text-sm text-zinc-500 font-normal leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2.5 shrink-0">{action}</div>}
    </div>
  );
}

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-burgundy px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-xs transition hover:bg-wine focus:outline-none focus:ring-2 focus:ring-burgundy/20 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none";

export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-xs sm:text-sm font-medium text-zinc-700 shadow-xs transition hover:bg-zinc-50 hover:text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none";

export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-xs sm:text-sm font-medium text-rose-700 shadow-xs transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none";

export const btnGhost =
  "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition disabled:opacity-50";

export const inputCls =
  "w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/15 transition shadow-xs";

export const labelCls =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-600";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-12 text-center shadow-xs">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
        <HugeiconsIcon icon={File01Icon} size={22} />
      </div>
      <h3 className="mt-3.5 text-sm font-semibold text-zinc-900">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-zinc-500 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  makeHref,
}: {
  page: number;
  totalPages: number;
  makeHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-zinc-100 pt-4 text-xs font-medium text-zinc-500 sm:flex-row">
      <span>
        Showing page <span className="font-semibold text-zinc-900">{page}</span> of{" "}
        <span className="font-semibold text-zinc-900">{totalPages}</span>
      </span>
      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link
            href={makeHref(page - 1)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            ← Previous
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-400 cursor-not-allowed">
            ← Previous
          </span>
        )}
        {page < totalPages ? (
          <Link
            href={makeHref(page + 1)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
          >
            Next →
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-400 cursor-not-allowed">
            Next →
          </span>
        )}
      </div>
    </div>
  );
}

export function Card({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200/80 bg-white shadow-xs ${className}`}
    >
      {(title || description || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-5 py-4">
          <div>
            {title && (
              <h3 className="text-sm font-semibold tracking-tight text-zinc-900">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-0.5 text-xs text-zinc-500 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
