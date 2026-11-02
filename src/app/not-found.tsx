import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-wine px-5 text-center">
      <p className="gold-text font-display text-6xl font-semibold">Oops!</p>
      <h1 className="mt-4 font-display text-2xl text-champagne">
        We couldn&rsquo;t find that page or invitation.
      </h1>
      <p className="mt-2 max-w-md text-sm text-champagne/70">
        The link may be incorrect, or the ticket may have been replaced. You can
        retrieve your invitation securely with your registered email or phone.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/"
          className="rounded-full border border-champagne/40 px-6 py-3 text-sm text-champagne hover:border-gold hover:text-gold"
        >
          Go Home
        </Link>
        <Link
          href="/invitation"
          className="rounded-full bg-gold px-6 py-3 text-sm font-medium text-wine hover:bg-champagne"
        >
          Retrieve My Invitation
        </Link>
      </div>
    </div>
  );
}
