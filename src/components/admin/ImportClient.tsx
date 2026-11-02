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
  btnPrimary,
  btnSecondary,
  inputCls,
} from "@/components/admin/ui";

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
  if (row.email && !/^\S+@\S+\.\S+$/.test(row.email)) return "Invalid email";
  return null;
}

export default function ImportClient({ groupNames }: { groupNames: string[] }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [pending, startTransition] = useTransition();

  const analysis = useMemo(() => {
    if (!rows) return null;
    const seen = new Map<string, number>();
    return rows.map((row, i) => {
      const error = validateRow(row);
      const key = (row.email || row.phone || row.fullName).toLowerCase();
      const duplicateOf = seen.has(key) ? seen.get(key)! : null;
      if (!seen.has(key)) seen.set(key, i);
      const unknownGroup =
        row.group !== "" &&
        !groupNames.some((g) => g.toLowerCase() === row.group.toLowerCase());
      return { error, duplicateOf, unknownGroup };
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
          setParseError(
            "Could not find a name column. Expected headers like: Full Name, Email, Phone, Group, Inviter, Notes.",
          );
          setRows(null);
          return;
        }
        setRows(normalized);
      },
      error: (err) => setParseError(err.message),
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
      const result = await importGuestsAction(payload);
      setSummary(result);
      if (result.ok) setRows(null);
    });
  }

  return (
    <>
      <PageHeader
        title="Import Guest CSV"
        description="Preload approved guests. Columns: Full Name (required), Email, Phone, Group, Inviter, Notes."
        action={
          <Link href="/admin/guests" className="text-sm text-slate-500 hover:text-burgundy">
            ← Back to guests
          </Link>
        }
      />

      {summary && (
        <div
          className={`mb-5 rounded-xl border p-5 ${
            summary.ok
              ? "border-emerald-200 bg-emerald-50"
              : "border-red-200 bg-red-50"
          }`}
        >
          <p className="font-medium text-slate-800">{summary.message}</p>
          <p className="mt-1 text-sm text-slate-600">
            {summary.imported} imported · {summary.skippedDuplicates} skipped as
            existing guests · {summary.errors.length} errors
          </p>
          {summary.errors.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-xs text-red-700">
              {summary.errors.map((e, i) => (
                <li key={i}>
                  Row {e.row}: {e.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {!rows && (
        <label className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 bg-white p-14 text-center transition hover:border-burgundy">
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
          <p className="text-lg font-medium text-slate-700">
            Click to choose a CSV file
          </p>
          <p className="mt-1 text-sm text-slate-500">
            The header row is detected automatically; common column names are
            recognised.
          </p>
        </label>
      )}

      {parseError && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{parseError}</p>
      )}

      {rows && analysis && (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-800">{fileName}</span> —{" "}
              {rows.length} rows · <span className="text-emerald-700">{validCount} ready</span>
              {rows.length - validCount > 0 && (
                <span className="text-amber-700">
                  {" "}
                  · {rows.length - validCount} will be skipped
                </span>
              )}
            </p>
            <div className="flex gap-2">
              <button className={btnSecondary} onClick={() => setRows(null)}>
                Choose Another File
              </button>
              <button
                className={btnPrimary}
                disabled={pending || validCount === 0}
                onClick={runImport}
              >
                {pending ? "Importing…" : `Import ${validCount} Guests`}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[900px] text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2.5">#</th>
                  <th className="px-3 py-2.5">Full Name</th>
                  <th className="px-3 py-2.5">Email</th>
                  <th className="px-3 py-2.5">Phone</th>
                  <th className="px-3 py-2.5">Group</th>
                  <th className="px-3 py-2.5">Inviter</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, i) => {
                  const a = analysis[i];
                  return (
                    <tr
                      key={i}
                      className={
                        a.error
                          ? "bg-red-50/60"
                          : a.duplicateOf !== null
                            ? "bg-amber-50/60"
                            : undefined
                      }
                    >
                      <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                      {(["fullName", "email", "phone", "group", "inviter"] as const).map(
                        (field) => (
                          <td key={field} className="px-2 py-1.5">
                            <input
                              value={row[field]}
                              onChange={(e) => updateCell(i, field, e.target.value)}
                              className={`${inputCls} !px-2 !py-1.5 !text-xs`}
                            />
                          </td>
                        ),
                      )}
                      <td className="px-3 py-2">
                        {a.error ? (
                          <span className="text-red-700">{a.error}</span>
                        ) : a.duplicateOf !== null ? (
                          <span className="text-amber-700">
                            Duplicate of row {a.duplicateOf + 1}
                          </span>
                        ) : a.unknownGroup ? (
                          <span className="text-amber-700">
                            New group name (will be unassigned)
                          </span>
                        ) : (
                          <span className="text-emerald-700">Ready</span>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => removeRow(i)}
                          className="text-slate-400 hover:text-red-600"
                          aria-label="Remove row"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
