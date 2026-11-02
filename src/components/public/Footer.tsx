import { EVENT } from "@/lib/constants";
import Link from "next/link";

export default function Footer({
  rsvp1,
  rsvp2,
}: {
  rsvp1: string;
  rsvp2: string;
}) {
  return (
    <footer className="bg-wine text-champagne">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="font-display text-2xl font-semibold tracking-[0.2em]">
              DELOUS <span className="gold-text">&rsquo;26</span>
            </div>
            <p className="mt-3 text-sm text-champagne/70">
              {EVENT.couple}
              <br />
              {EVENT.dateLabel}
              <br />
              Lagos, Nigeria
            </p>
          </div>
          <div>
            <h3 className="font-display text-lg text-gold">RSVP / Enquiries</h3>
            <ul className="mt-3 space-y-2 text-sm text-champagne/80">
              <li>{rsvp1}</li>
              <li>{rsvp2}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-display text-lg text-gold">Quick Links</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/register" className="text-champagne/80 hover:text-gold">
                  Register to attend
                </Link>
              </li>
              <li>
                <Link href="/invitation" className="text-champagne/80 hover:text-gold">
                  Retrieve my invitation
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-champagne/80 hover:text-gold">
                  Frequently asked questions
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="ornament-divider mt-12 text-xs tracking-[0.3em]">
          ÌFẸ́ NI GBOGBO RẸ̀ — LOVE IS EVERYTHING
        </div>
        <p className="mt-6 text-center text-xs text-champagne/50">
          © 2026 DELOUS &rsquo;26 · One person, one ticket ·{" "}
          <Link href="/admin" className="hover:text-gold">
            Admin
          </Link>
        </p>
      </div>
    </footer>
  );
}
