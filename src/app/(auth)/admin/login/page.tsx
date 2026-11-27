"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction, type LoginState } from "./actions";
import { inputCls, labelCls, btnPrimary } from "@/components/admin/ui";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Mail01Icon,
  LockPasswordIcon,
  Shield01Icon,
  Alert02Icon,
} from "@hugeicons/core-free-icons";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <div>
        <label className={labelCls}>Staff Email Address</label>
        <div className="relative">
          <HugeiconsIcon
            icon={Mail01Icon}
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            name="email"
            type="email"
            autoComplete="username"
            placeholder="staff@delous26.com"
            required
            className={`${inputCls} !pl-10 !py-2.5`}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Password</label>
        <div className="relative">
          <HugeiconsIcon
            icon={LockPasswordIcon}
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            required
            className={`${inputCls} !pl-10 !py-2.5`}
          />
        </div>
      </div>

      {state.error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
          <HugeiconsIcon icon={Alert02Icon} size={16} className="shrink-0 text-rose-600" />
          <span>{state.error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-burgundy py-3 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-wine focus:outline-none focus:ring-2 focus:ring-burgundy/20 disabled:opacity-60"
      >
        {pending ? "Authenticating staff..." : "Sign in to Dashboard"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="admin-dashboard flex min-h-screen items-center justify-center bg-zinc-50/80 px-4 py-12 antialiased font-sans">
      <div className="w-full max-w-sm">
        {/* Brand Crest & Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-burgundy text-white font-bold text-lg border border-gold/30 shadow-sm mb-3">
            D
          </div>
          <h1 className="text-xl font-bold tracking-[0.2em] text-burgundy">
            DELOUS &apos;26
          </h1>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-400">
            Administrative Management
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-7 shadow-xl shadow-zinc-900/5">
          <Suspense fallback={<div className="py-8 text-center text-xs text-zinc-400">Loading sign-in...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
          <HugeiconsIcon icon={Shield01Icon} size={14} />
          <span>Authorised wedding staff only.</span>
        </div>
      </div>
    </div>
  );
}
