"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Alert02Icon, HelpCircleIcon } from "@hugeicons/core-free-icons";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

const widthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

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
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-zinc-950/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Card */}
      <div
        ref={dialogRef}
        className={`relative w-full ${widthClasses[maxWidth]} overflow-hidden rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xl transition-all duration-200 animate-in fade-in zoom-in-95`}
      >
        <div className="flex items-start justify-between gap-4">
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
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} />
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "primary" | "warning";
  loading?: boolean;
}) {
  const getButtonClass = () => {
    switch (variant) {
      case "danger":
        return "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500";
      case "primary":
      default:
        return "bg-burgundy hover:bg-wine text-white focus:ring-burgundy";
    }
  };

  const getIcon = () => {
    switch (variant) {
      case "danger":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <HugeiconsIcon icon={Alert02Icon} size={20} />
          </div>
        );
      case "warning":
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <HugeiconsIcon icon={HelpCircleIcon} size={20} />
          </div>
        );
      case "primary":
      default:
        return (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-burgundy/10 text-burgundy">
            <HugeiconsIcon icon={HelpCircleIcon} size={20} />
          </div>
        );
    }
  };

  return (
    <Modal open={open} onClose={loading ? () => {} : onClose} maxWidth="sm">
      <div className="flex items-start gap-3.5">
        {getIcon()}
        <div className="flex-1">
          <h4 className="text-sm font-semibold text-zinc-900">{title}</h4>
          <p className="mt-1.5 text-xs text-zinc-600 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-2.5">
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          className="rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-400 disabled:opacity-50"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={onConfirm}
          className={`rounded-lg px-3.5 py-2 text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 ${getButtonClass()}`}
        >
          {loading ? "Processing..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
