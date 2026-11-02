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

  function run(
    action: (id: number) => Promise<ActionResult>,
    confirmText?: string,
  ) {
    if (confirmText && !window.confirm(confirmText)) return;
    startTransition(async () => {
      setResult(await action(guestId));
    });
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-700">Actions</h2>
      <div className="flex flex-wrap gap-2">
        {status === "registered" && (
          <button
            disabled={pending}
            className={btnPrimary}
            onClick={() => run(confirmRegistrationAction)}
          >
            Confirm Registration
          </button>
        )}
        {hasEmail && status !== "revoked" && (
          <button
            disabled={pending}
            className={btnSecondary}
            onClick={() =>
              run(
                resendInvitationAction,
                "Resend the invitation? The previous QR ticket will be replaced with a new one.",
              )
            }
          >
            Resend Invitation
          </button>
        )}
        {checkedIn && (
          <button
            disabled={pending}
            className={btnSecondary}
            onClick={() =>
              run(undoCheckInAction, "Reverse this guest's check-in?")
            }
          >
            Undo Check-in
          </button>
        )}
        {status !== "revoked" ? (
          <button
            disabled={pending}
            className={btnDanger}
            onClick={() =>
              run(
                revokeGuestAction,
                "Deactivate this guest's ticket and admission credentials? They will be rejected at the entrance.",
              )
            }
          >
            Deactivate Ticket
          </button>
        ) : (
          <button
            disabled={pending}
            className={btnPrimary}
            onClick={() =>
              run(
                reactivateGuestAction,
                "Reactivate this guest and issue a fresh ticket?",
              )
            }
          >
            Reactivate Guest
          </button>
        )}
      </div>
      {result && (
        <p
          className={`mt-3 rounded-lg p-2.5 text-sm ${
            result.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {result.message}
        </p>
      )}
    </div>
  );
}
