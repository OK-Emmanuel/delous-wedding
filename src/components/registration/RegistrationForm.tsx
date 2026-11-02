"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  registrationSchema,
  type RegistrationInput,
} from "@/lib/validation/registration";
import {
  ADMISSION_NOTICE,
  ATTENDANCE_OPTIONS,
  RELATIONSHIP_OPTIONS,
} from "@/lib/constants";

const inputCls =
  "w-full rounded-xl border border-gold/40 bg-white px-4 py-3 text-sm text-rich-black placeholder:text-rich-black/35 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";
const labelCls = "mb-1.5 block text-sm font-medium text-burgundy";
const errCls = "mt-1 text-xs text-red-600";

export default function RegistrationForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [already, setAlready] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
  });

  async function onSubmit(data: RegistrationInput) {
    setServerError(null);
    setAlready(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setServerError(json.error ?? "Something went wrong. Please try again.");
        return;
      }
      if (json.invitationToken) {
        router.push(`/invitation/${json.invitationToken}?welcome=1`);
      } else if (json.alreadyRegistered) {
        setAlready(
          `You are already registered (${json.attendeeCode}). Your details have been updated — use "Retrieve my invitation" to access your existing ticket.`,
        );
      }
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5 rounded-3xl border border-gold/30 bg-white p-7 shadow-xl shadow-gold/5 md:p-10"
      noValidate
    >
      <div>
        <label htmlFor="fullName" className={labelCls}>
          Full name *
        </label>
        <input
          id="fullName"
          placeholder="e.g. Adewale Johnson"
          className={inputCls}
          {...register("fullName")}
        />
        {errors.fullName && <p className={errCls}>{errors.fullName.message}</p>}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelCls}>
            Email address *
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className={inputCls}
            {...register("email")}
          />
          {errors.email && <p className={errCls}>{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="phone" className={labelCls}>
            Phone number *
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="e.g. 0803 123 4567"
            className={inputCls}
            {...register("phone")}
          />
          {errors.phone && <p className={errCls}>{errors.phone.message}</p>}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="relationship" className={labelCls}>
            Relationship with the couple *
          </label>
          <select id="relationship" className={inputCls} defaultValue="" {...register("relationship")}>
            <option value="" disabled>
              Select…
            </option>
            {RELATIONSHIP_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {errors.relationship && (
            <p className={errCls}>{errors.relationship.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="attendanceResponse" className={labelCls}>
            Will you attend? *
          </label>
          <select
            id="attendanceResponse"
            className={inputCls}
            defaultValue=""
            {...register("attendanceResponse")}
          >
            <option value="" disabled>
              Select…
            </option>
            {ATTENDANCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {errors.attendanceResponse && (
            <p className={errCls}>{errors.attendanceResponse.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="invitedBy" className={labelCls}>
          Who invited you? *
        </label>
        <input
          id="invitedBy"
          placeholder="e.g. the bride, Mrs Adesola, Pastor Daniel…"
          className={inputCls}
          {...register("invitedBy")}
        />
        {errors.invitedBy && <p className={errCls}>{errors.invitedBy.message}</p>}
      </div>

      <div className="rounded-xl border border-burgundy/20 bg-champagne/40 p-4 text-xs leading-relaxed text-burgundy">
        {ADMISSION_NOTICE}
      </div>

      <label className="flex items-start gap-3 text-sm text-rich-black/75">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-[#541323]"
          {...register("consent")}
        />
        <span>
          I consent to my details being used to manage my attendance at this
          wedding, and I understand this invitation admits one person only. *
        </span>
      </label>
      {errors.consent && <p className={errCls}>{errors.consent.message}</p>}

      {serverError && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{serverError}</p>
      )}
      {already && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{already}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-full bg-burgundy py-4 font-medium tracking-wide text-champagne shadow-lg transition hover:bg-wine disabled:opacity-60"
      >
        {isSubmitting ? "Registering…" : "Complete My Registration"}
      </button>
    </motion.form>
  );
}
