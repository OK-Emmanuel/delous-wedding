"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Papa from "papaparse";
import {
  importGuestsAction,
  type ImportSummary,
} from "@/app/admin/guests/actions";
import {
  PageHeader,
  Card,
  Badge,
  btnPrimary,
  btnSecondary,
  inputCls,
} from "@/components/admin/ui";
import { useToast } from "@/components/admin/Toast";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FileImportIcon,
  CheckmarkCircle01Icon,
  Alert02Icon,
  ArrowLeft01Icon,
  Delete02Icon,
  Upload04Icon,
} from "@hugeicons/core-free-icons";

type Row = {
  fullName: string;
  email: string;
  phone: string;
  group: string;
  inviter: string;
  notes: string;
};

const HEADER_ALIASES: Record<keyof Row, string[]> = {
  fullName: ["full name", "fullname", "name", "names", "guest name"],
  email: ["email", "email address", "e-mail"],
  phone: ["phone", "phone number", "telephone", "mobile", "tel"],
  group: ["group", "invitation group", "table", "table name", "category"],
  inviter: ["inviter", "invited by", "who invited", "host"],
  notes: ["notes", "note", "comment", "comments", "internal notes"],
};

function normalizeRows(data: Record<string, string>[]): {
  rows: Row[];
  matchedColumns: string[];
} {
  if (data.length === 0) return { rows: [], matchedColumns: [] };
  const headers = Object.keys(data[0]);
  const mapping = new Map<keyof Row, string>();
  for (const [field, aliases] of Object.entries(HEADER_ALIASES) as [
    keyof Row,
    string[],
  ][]) {
    const found = headers.find((h) => aliases.includes(h.trim().toLowerCase()));
    if (found) mapping.set(field, found);
  }
  const rows = data
    .map((raw) => ({
      fullName: (raw[mapping.get("fullName") ?? ""] ?? "").trim().replace(/\s+/g, " "),
      email: (raw[mapping.get("email") ?? ""] ?? "").trim(),
      phone: (raw[mapping.get("phone") ?? ""] ?? "").trim(),
      group: (raw[mapping.get("group") ?? ""] ?? "").trim(),
      inviter: (raw[mapping.get("inviter") ?? ""] ?? "").trim(),
      notes: (raw[mapping.get("notes") ?? ""] ?? "").trim(),
    }))
    .filter((r) => Object.values(r).some((v) => v !== ""));
  return { rows, matchedColumns: [...mapping.keys()] };
}

function validateRow(row: Row): string | null {
  if (!row.fullName || row.fullName.length < 2) return "Full name is required";
  if (row.email && !/^\S+@\S+\.\S+$/.test(row.email)) return "Invalid email address";
  return null;
}

export default function ImportClient({ groupNames }: { groupNames: string[] }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [pending, startTransition] = useTransition();
  const { success, error } = useToast();

  const analysis = useMemo(() => {
    if (!rows) return null;
    const seen = new Map<string, number>();
    return rows.map((row, i) => {
      const err = validateRow(row);
      const key = (row.email || row.phone || row.fullName).toLowerCase();
      const duplicateOf = seen.has(key) ? seen.get(key)! : null;
      if (!seen.has(key)) seen.set(key, i);
      const unknownGroup =
        row.group !== "" &&
        !groupNames.some((g) => g.toLowerCase() === row.group.toLowerCase());
      return { error: err, duplicateOf, unknownGroup };
    });
  }, [rows, groupNames]);

  const validCount =
    rows && analysis
      ? rows.filter((_, i) => !analysis[i].error && analysis[i].duplicateOf === null).length
      : 0;

  function handleFile(file: File) {
    setSummary(null);
    setParseError(null);
    setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: "greedy",
      complete: (result) => {
        const { rows: normalized, matchedColumns } = normalizeRows(
          result.data,
        );
        if (!matchedColumns.includes("fullName")) {
          const errMsg =
            "Could not identify a name column. Expected headers like: Full Name, Email, Phone, Group, Inviter, Notes.";
          setParseError(errMsg);
          error(errMsg);
          setRows(null);
          return;
        }
        setRows(normalized);
        success(`Parsed ${normalized.length} rows from ${file.name}`);
      },
      error: (err) => {
        setParseError(err.message);
        error(err.message);
      },
    });
  }

  function updateCell(index: number, field: keyof Row, value: string) {
    setRows((prev) =>
      prev ? prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)) : prev,
    );
  }

  function removeRow(index: number) {
    setRows((prev) => (prev ? prev.filter((_, i) => i !== index) : prev));
  }

  function runImport() {
    if (!rows || !analysis) return;
    const payload = rows
      .filter((_, i) => !analysis[i].error && analysis[i].duplicateOf === null)
      .map((r) => ({ ...r }));
    startTransition(async () => {
      try {
        const result = await importGuestsAction(payload);
        setSummary(result);
        if (result.ok) {
          success(result.message);
          setRows(null);
        } else {
          error(result.message);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Import failed";
        error(msg);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
        <Link
          href="/admin/guests"
          className="inline-flex items-center gap-1 font-medium text-zinc-600 hover:text-burgundy transition"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} />
          <span>Back to guest directory</span>
        </Link>
      </div>

      <PageHeader
        title="Import Guest CSV"
        description="Preload approved guests in bulk. Supported column names: Full Name, Email, Phone, Group, Inviter, Notes."
      />

      {summary && (
        <div
          className={`rounded-2xl border p-5 ${
            summary.ok
              ? "border-emerald-200 bg-emerald-50/70 text-emerald-950"
              : "border-rose-200 bg-rose-50/70 text-rose-950"
          }`}
        >
          <div className="flex items-start gap-3">
            <HugeiconsIcon
              icon={summary.ok ? CheckmarkCircle01Icon : Alert02Icon}
              size={20}
              className={summary.ok ? "text-emerald-700" : "text-rose-700"}
            />
            <div className="flex-1">
              <p className="font-semibold text-sm">{summary.message}</p>
              <p className="mt-1 text-xs opacity-90">
                {summary.imported} imported · {summary.skippedDuplicates} skipped as
                existing guests · {summary.errors.length} failed
              </p>
              {summary.errors.length > 0 && (
                <ul className="mt-3 list-inside list-disc text-xs space-y-1">
                  {summary.errors.map((e, i) => (
                    <li key={i}>
                      Row {e.row}: {e.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {!rows && (
        <Card>
          <label className="flex flex-col items-center justify-center cursor-pointer rounded-xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center transition hover:border-burgundy/50 hover:bg-zinc-50">
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-burgundy/10 text-burgundy mb-3">
              <HugeiconsIcon icon={Upload04Icon} size={24} />
            </div>
            <p className="text-sm font-semibold text-zinc-900">
              Click to select or drag a CSV file
            </p>
            <p className="mt-1 text-xs text-zinc-500 max-w-sm">
              Columns are auto-detected. Full name is required; email, phone, and invitation group are optional.
            </p>
          </label>
        </Card>
      )}

      {parseError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800 flex items-center gap-2">
          <HugeiconsIcon icon={Alert02Icon} size={16} />
          <span>{parseError}</span>
        </div>
      )}

      {rows && analysis && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-xs">
            <div className="text-xs text-zinc-600">
              <span className="font-semibold text-zinc-900">{fileName}</span> —{" "}
              {rows.length} rows detected ·{" "}
              <span className="font-semibold text-emerald-700">{validCount} valid</span>
              {rows.length - validCount > 0 && (
                <span className="font-semibold text-amber-700">
                  {" "}
                  · {rows.length - validCount} with warnings/duplicates
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={btnSecondary}
                onClick={() => setRows(null)}
              >
                Choose Another File
              </button>
              <button
                type="button"
                className={btnPrimary}
                disabled={pending || validCount === 0}
                onClick={runImport}
              >
                <HugeiconsIcon icon={FileImportIcon} size={15} />
                <span>
                  {pending ? "Importing records..." : `Import ${validCount} Guests`}
                </span>
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-xs">
                <thead className="border-b border-zinc-100 bg-zinc-50/75 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-3.5 py-3">#</th>
                    <th className="px-3 py-3">Full Name *</th>
                    <th className="px-3 py-3">Email</th>
                    <th className="px-3 py-3">Phone</th>
                    <th className="px-3 py-3">Group</th>
                    <th className="px-3 py-3">Inviter</th>
                    <th className="px-3.5 py-3">Status</th>
                    <th className="px-3 py-3 text-right" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {rows.map((row, i) => {
                    const a = analysis[i];
                    return (
                      <tr
                        key={i}
                        className={
                          a.error
                            ? "bg-rose-50/40"
                            : a.duplicateOf !== null
                              ? "bg-amber-50/40"
                              : "hover:bg-zinc-50/50"
                        }
                      >
                        <td className="px-3.5 py-2 font-mono text-zinc-400">
                          {i + 1}
                        </td>
                        {(["fullName", "email", "phone", "group", "inviter"] as const).map(
                          (field) => (
                            <td key={field} className="px-2 py-1.5">
                              <input
                                value={row[field]}
                                onChange={(e) => updateCell(i, field, e.target.value)}
                                className={`${inputCls} !py-1 !text-xs !rounded-md`}
                              />
                            </td>
                          ),
                        )}
                        <td className="px-3.5 py-2">
                          {a.error ? (
                            <span className="font-medium text-rose-700">{a.error}</span>
                          ) : a.duplicateOf !== null ? (
                            <span className="font-medium text-amber-700">
                              Duplicate of row {a.duplicateOf + 1}
                            </span>
                          ) : a.unknownGroup ? (
                            <span className="text-amber-700">
                              New group (unassigned)
                            </span>
                          ) : (
                            <span className="font-medium text-emerald-700">Ready</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => removeRow(i)}
                            className="rounded p-1 text-zinc-400 hover:text-rose-600 transition"
                            aria-label="Remove row"
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
