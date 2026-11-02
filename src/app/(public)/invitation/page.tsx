import RecoveryForm from "@/components/invitation/RecoveryForm";
import Link from "next/link";

export const metadata = { title: "Retrieve My Invitation — DELOUS '26" };

export default function InvitationRecoveryPage() {
  return (
    <div className="bg-ivory pb-24 pt-32">
      <div className="mx-auto max-w-md px-5">
        <div className="mb-10 text-center">
          <p className="text-xs tracking-[0.4em] text-gold">TICKET RECOVERY</p>
          <h1 className="mt-3 font-display text-4xl font-medium text-burgundy">
            Retrieve My Invitation
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-rich-black/70">
            Lost your invitation email? Enter your registered email address or
            phone number and we&rsquo;ll send a one-time verification code.
          </p>
        </div>
        <RecoveryForm />
        <p className="mt-6 text-center text-xs text-rich-black/50">
          Not registered yet?{" "}
          <Link href="/register" className="text-burgundy underline underline-offset-2">
            Register to attend
          </Link>
        </p>
      </div>
    </div>
  );
}
