"use client";

import { useState, useTransition } from "react";
import {
  confirmRegistrationAction,
  reactivateGuestAction,
  resendInvitationAction,
  revokeGuestAction,
  undoCheckInAction,
  type ActionResult,
} from "@/app/admin/guests/actions";
import { btnDanger, btnPrimary, btnSecondary } from "@/components/admin/ui";
import { ConfirmModal } from "@/components/admin/Modal";
import { useToast } from "@/components/admin/Toast";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Mail01Icon,
  CancelCircleIcon,
  RefreshIcon,
  ArrowTurnBackwardIcon,
} from "@hugeicons/core-free-icons";

export default function GuestActions({
  guestId,
  status,
  hasEmail,
  checkedIn,
}: {
  guestId: number;
  status: string;
  hasEmail: boolean;
  checkedIn: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);
  const { success, error } = useToast();

  // Confirmation modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    variant: "danger" | "primary" | "warning";
    action: (id: number) => Promise<ActionResult>;
  } | null>(null);

  const executeAction = (action: (id: number) => Promise<ActionResult>) => {
    startTransition(async () => {
      try {
        const res = await action(guestId);
        setResult(res);
        if (res.ok) {
          success(res.message);
        } else {
          error(res.message);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Action failed";
        error(message);
      } finally {
        setConfirmConfig(null);
      }
    });
  };

  const requestConfirmation = (
    action: (id: number) => Promise<ActionResult>,
    title: string,
    message: string,
    confirmLabel: string,
    variant: "danger" | "primary" | "warning" = "primary"
  ) => {
    setConfirmConfig({
      open: true,
      title,
      message,
      confirmLabel,
      variant,
      action,
    });
  };

  return (
    <>
      <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3.5">
          Guest Actions
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {status === "registered" && (
            <button
              type="button"
              disabled={pending}
              className={btnPrimary}
              onClick={() => executeAction(confirmRegistrationAction)}
            >
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={15} />
              <span>Confirm Registration</span>
            </button>
          )}

          {hasEmail && status !== "revoked" && (
            <button
              type="button"
              disabled={pending}
              className={btnSecondary}
              onClick={() =>
                requestConfirmation(
                  resendInvitationAction,
                  "Resend Invitation Email",
                  "Resending will issue a fresh digital QR pass and render the prior code inactive. Are you sure?",
                  "Resend Ticket",
                  "primary"
                )
              }
            >
              <HugeiconsIcon icon={Mail01Icon} size={15} />
              <span>Resend Invitation</span>
            </button>
          )}

          {checkedIn && (
            <button
              type="button"
              disabled={pending}
              className={btnSecondary}
              onClick={() =>
                requestConfirmation(
                  undoCheckInAction,
                  "Reverse Check-in",
                  "Reversing check-in restores this guest's ticket to unused status. Do you wish to continue?",
                  "Reverse Admission",
                  "warning"
                )
              }
            >
              <HugeiconsIcon icon={ArrowTurnBackwardIcon} size={15} />
              <span>Undo Check-in</span>
            </button>
          )}

          {status !== "revoked" ? (
            <button
              type="button"
              disabled={pending}
              className={btnDanger}
              onClick={() =>
                requestConfirmation(
                  revokeGuestAction,
                  "Deactivate Guest Ticket",
                  "Deactivating admission credentials revokes entry at the checkpoint. They will be turned away if scanned.",
                  "Revoke Access",
                  "danger"
                )
              }
            >
              <HugeiconsIcon icon={CancelCircleIcon} size={15} />
              <span>Deactivate Ticket</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={pending}
              className={btnPrimary}
              onClick={() =>
                requestConfirmation(
                  reactivateGuestAction,
                  "Reactivate Guest",
                  "Reactivating this guest restores their profile and generates an active digital pass.",
                  "Reactivate & Reissue",
                  "primary"
                )
              }
            >
              <HugeiconsIcon icon={RefreshIcon} size={15} />
              <span>Reactivate Guest</span>
            </button>
          )}
        </div>

        {result && (
          <div
            className={`mt-4 rounded-xl border p-3 text-xs font-medium ${
              result.ok
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {result.message}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmConfig && (
        <ConfirmModal
          open={confirmConfig.open}
          onClose={() => setConfirmConfig(null)}
          onConfirm={() => executeAction(confirmConfig.action)}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmLabel={confirmConfig.confirmLabel}
          variant={confirmConfig.variant}
          loading={pending}
        />
      )}
    </>
  );
}
