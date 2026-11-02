"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export type NavItem = { href: string; label: string; icon: string };

export default function AdminSidebar({
  items,
  userName,
  roleLabel,
  logout,
}: {
  items: NavItem[];
  userName: string;
  roleLabel: string;
  logout: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
      {items.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
              active
                ? "bg-burgundy text-white"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <span aria-hidden>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="border-t border-white/10 px-4 py-4">
      <p className="truncate text-sm font-medium text-white">{userName}</p>
      <p className="text-xs text-slate-400">{roleLabel}</p>
      <form action={logout}>
        <button className="mt-3 w-full rounded-lg border border-white/20 py-2 text-xs text-slate-300 transition hover:bg-white/10">
          Sign out
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between bg-wine px-4 py-3 md:hidden">
        <span className="font-display text-lg font-semibold tracking-[0.15em] text-champagne">
          DELOUS &rsquo;26 <span className="text-xs text-slate-400">ADMIN</span>
        </span>
        <button
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
          className="text-champagne"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>
      {open && (
        <div className="fixed inset-x-0 bottom-0 top-12 z-30 flex flex-col bg-wine md:hidden">
          {nav}
          {footer}
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col bg-wine md:flex">
        <div className="px-5 py-5">
          <p className="font-display text-xl font-semibold tracking-[0.15em] text-champagne">
            DELOUS &rsquo;26
          </p>
          <p className="text-[10px] uppercase tracking-[0.35em] text-slate-400">
            Admin · Private
          </p>
        </div>
        {nav}
        {footer}
      </aside>
    </>
  );
}
