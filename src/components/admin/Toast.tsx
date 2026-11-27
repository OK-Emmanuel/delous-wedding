"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Alert02Icon,
  InformationCircleIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextValue {
  toasts: ToastItem[];
  toast: (options: { type?: ToastType; title?: string; message: string; duration?: number }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    ({
      type = "info",
      title,
      message,
      duration = 4500,
    }: {
      type?: ToastType;
      title?: string;
      message: string;
      duration?: number;
    }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const success = useCallback(
    (message: string, title?: string) => toast({ type: "success", title, message }),
    [toast]
  );

  const error = useCallback(
    (message: string, title?: string) => toast({ type: "error", title, message }),
    [toast]
  );

  const info = useCallback(
    (message: string, title?: string) => toast({ type: "info", title, message }),
    [toast]
  );

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <HugeiconsIcon icon={CheckmarkCircle01Icon} size={18} className="text-emerald-600 shrink-0 mt-0.5" />;
      case "error":
        return <HugeiconsIcon icon={Alert02Icon} size={18} className="text-rose-600 shrink-0 mt-0.5" />;
      case "info":
      default:
        return <HugeiconsIcon icon={InformationCircleIcon} size={18} className="text-blue-600 shrink-0 mt-0.5" />;
    }
  };

  const getStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return "border-emerald-200/80 bg-white text-emerald-950";
      case "error":
        return "border-rose-200/80 bg-white text-rose-950";
      case "info":
      default:
        return "border-zinc-200/80 bg-white text-zinc-900";
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, info, dismiss }}>
      {children}
      {/* Toast viewport */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end gap-2.5 p-4 sm:p-6"
      >
        <div className="flex w-full flex-col items-center space-y-2.5 sm:items-end">
          {toasts.map((item) => (
            <div
              key={item.id}
              role="alert"
              className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg shadow-zinc-900/5 transition-all duration-200 ${getStyles(
                item.type
              )}`}
            >
              {getIcon(item.type)}
              <div className="flex-1 min-w-0">
                {item.title && (
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-900">
                    {item.title}
                  </p>
                )}
                <p className="text-sm font-medium text-zinc-700 leading-snug break-words">
                  {item.message}
                </p>
              </div>
              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="shrink-0 rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition"
                aria-label="Close notification"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
