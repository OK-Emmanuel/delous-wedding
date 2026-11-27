"use client";

import { useEffect, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  position?: "left" | "right";
  width?: "sm" | "md" | "lg";
}

const widthMap = {
  sm: "max-w-xs",
  md: "max-w-md",
  lg: "max-w-lg",
};

export function Drawer({
  open,
  onClose,
  title,
  description,
  children,
  position = "right",
  width = "md",
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={`fixed inset-y-0 ${
          position === "left" ? "left-0" : "right-0"
        } flex w-full ${widthMap[width]} max-w-full`}
      >
        <div className="flex h-full w-full flex-col bg-white shadow-2xl border-l border-zinc-200/80 transition-transform duration-300">
          {(title || description) && (
            <div className="flex items-start justify-between border-b border-zinc-100 px-6 py-5">
              <div>
                {title && (
                  <h3 className="text-base font-semibold tracking-tight text-zinc-900">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close drawer"
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
              </button>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
