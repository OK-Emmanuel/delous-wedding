"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Analytics01Icon,
  UserGroupIcon,
  FolderLibraryIcon,
  FileEditIcon,
  Ticket01Icon,
  CheckmarkCircle01Icon,
  Image01Icon,
  HelpCircleIcon,
  Mail01Icon,
  ChartIncreaseIcon,
  Shield01Icon,
  Settings01Icon,
  Logout01Icon,
  Menu01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

export type NavItem = { href: string; label: string; icon: string };

const ICON_MAP: Record<string, typeof Analytics01Icon> = {
  overview: Analytics01Icon,
  guests: UserGroupIcon,
  groups: FolderLibraryIcon,
  registrations: FileEditIcon,
  tickets: Ticket01Icon,
  checkin: CheckmarkCircle01Icon,
  gallery: Image01Icon,
  faqs: HelpCircleIcon,
  emails: Mail01Icon,
  reports: ChartIncreaseIcon,
  staff: Shield01Icon,
  settings: Settings01Icon,
};

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

  // Close mobile drawer when route changes
  useEffect(() => {
    // React Hooks Rule: do not set state synchronously in effect body
    const handle = requestAnimationFrame(() => {
      setOpen(false);
    });
    return () => cancelAnimationFrame(handle);
  }, [pathname]);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const initials = userName
    ? userName
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AD";

  const renderNavLinks = () => (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3.5 py-4">
      {items.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        const IconComponent = ICON_MAP[item.icon] ?? Analytics01Icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium transition-all duration-150 ${
              active
                ? "bg-burgundy text-white shadow-xs shadow-black/20"
                : "text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
            }`}
          >
            <span
              aria-hidden
              className={`flex shrink-0 items-center transition-colors ${
                active ? "text-gold" : "text-zinc-400 group-hover:text-zinc-200"
              }`}
            >
              <HugeiconsIcon icon={IconComponent} size={18} />
            </span>
            <span className="truncate">{item.label}</span>
            {active && (
              <span
                aria-hidden
                className="absolute right-2.5 h-1.5 w-1.5 rounded-full bg-gold"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );

  const renderFooter = () => (
    <div className="border-t border-white/[0.08] p-4 bg-black/20">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-burgundy/80 text-xs font-semibold text-white border border-white/10 shadow-xs">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-zinc-100">{userName}</p>
          <span className="inline-block truncate text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
            {roleLabel}
          </span>
        </div>
      </div>
      <form action={logout} className="mt-3">
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-1 focus:ring-white/20"
        >
          <HugeiconsIcon icon={Logout01Icon} size={14} className="text-zinc-400" />
          <span>Sign Out</span>
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/10 bg-wine px-4 md:hidden shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-burgundy text-[11px] font-bold text-champagne border border-gold/30">
            D
          </div>
          <div>
            <span className="text-xs font-bold tracking-[0.15em] text-champagne">
              DELOUS &apos;26
            </span>
            <span className="ml-1.5 rounded bg-white/10 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-zinc-300">
              Admin
            </span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-champagne hover:bg-white/10 transition"
        >
          <HugeiconsIcon icon={open ? Cancel01Icon : Menu01Icon} size={18} />
        </button>
      </header>

      {/* Mobile Slide-Over Drawer */}
      {open && (
        <div className="fixed inset-0 z-40 flex md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Menu */}
          <div className="relative flex w-4/5 max-w-xs flex-1 flex-col bg-wine border-r border-white/10 shadow-2xl">
            <div className="flex h-14 items-center justify-between px-5 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-[0.18em] text-champagne">
                  DELOUS &apos;26
                </span>
                <span className="rounded bg-burgundy/60 px-1.5 py-0.5 text-[9px] font-semibold text-gold border border-gold/20">
                  PANEL
                </span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-white"
                aria-label="Close menu"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
              </button>
            </div>
            {renderNavLinks()}
            {renderFooter()}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-white/10 bg-wine md:flex">
        <div className="flex h-16 items-center gap-3 px-6 border-b border-white/[0.08]">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-burgundy text-xs font-bold text-champagne border border-gold/30 shadow-xs">
            D
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-champagne">
              DELOUS &apos;26
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-400">
              Wedding Portal
            </p>
          </div>
        </div>
        {renderNavLinks()}
        {renderFooter()}
      </aside>
    </>
  );
}
