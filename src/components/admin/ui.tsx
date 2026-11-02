import Link from "next/link";

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
  const accents = {
    burgundy: "border-l-burgundy",
    gold: "border-l-gold",
    emerald: "border-l-emerald-600",
    slate: "border-l-slate-400",
  };
  return (
    <div
      className={`rounded-xl border border-slate-200 border-l-4 bg-white p-5 shadow-sm ${accents[accent]}`}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

const badgeStyles: Record<string, string> = {
  preloaded: "bg-slate-100 text-slate-700",
  registered: "bg-blue-50 text-blue-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  revoked: "bg-red-50 text-red-700",
  active: "bg-emerald-50 text-emerald-700",
  archived: "bg-slate-100 text-slate-600",
  definitely: "bg-emerald-50 text-emerald-700",
  likely: "bg-blue-50 text-blue-700",
  unsure: "bg-amber-50 text-amber-700",
  declined: "bg-red-50 text-red-700",
  pending: "bg-amber-50 text-amber-700",
  sent: "bg-blue-50 text-blue-700",
  delivered: "bg-emerald-50 text-emerald-700",
  failed: "bg-red-50 text-red-700",
  bounced: "bg-red-50 text-red-700",
  draft: "bg-amber-50 text-amber-700",
  published: "bg-emerald-50 text-emerald-700",
  hidden: "bg-slate-100 text-slate-600",
  checked_in: "bg-emerald-50 text-emerald-700",
  qr: "bg-indigo-50 text-indigo-700",
  manual: "bg-amber-50 text-amber-700",
};

export function Badge({
  value,
  label,
}: {
  value: string;
  label?: string;
}) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        badgeStyles[value] ?? "bg-slate-100 text-slate-700"
      }`}
    >
      {label ?? value.replace(/_/g, " ")}
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
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-burgundy px-4 py-2 text-sm font-medium text-white transition hover:bg-wine disabled:opacity-50";
export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50";
export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50";
export const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/20";
export const labelCls = "mb-1 block text-sm font-medium text-slate-700";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <p className="text-lg font-medium text-slate-700">{title}</p>
      {description && (
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
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
    <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={makeHref(page - 1)} className={btnSecondary}>
            ← Previous
          </Link>
        )}
        {page < totalPages && (
          <Link href={makeHref(page + 1)} className={btnSecondary}>
            Next →
          </Link>
        )}
      </div>
    </div>
  );
}
