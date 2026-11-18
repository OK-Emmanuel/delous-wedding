import { EVENT } from "@/lib/constants";
import Link from "next/link";
import RsvpContactModal from "./RsvpContactModal";

export default function Footer({
  rsvp1,
  rsvp2,
}: {
  rsvp1: string;
  rsvp2: string;
}) {
  return (
    <footer className="bg-[#140308] text-champagne border-t border-gold/20">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="font-display text-3xl font-semibold tracking-[0.2em]">
              DELOUS <span className="gold-text">&rsquo;26</span>
            </div>
            <p className="mt-4 text-sm text-champagne/70 leading-relaxed max-w-md">
              {EVENT.couple}
              <br />
              {EVENT.dateLabel} &bull; Lagos, Nigeria
              <br />
              <span className="italic text-gold mt-1 block">
                &ldquo;A royal celebration of love, culture and legacy.&rdquo;
              </span>
            </p>
          </div>

          <div>
            <h3 className="font-display text-lg text-gold uppercase tracking-wider">
              RSVP &amp; Enquiries
            </h3>
            <p className="mt-2 text-xs text-champagne/60">
              Click a contact to call directly or chat on WhatsApp:
            </p>
            <div className="mt-3 space-y-2">
              <RsvpContactModal contactString={rsvp1} />
              <RsvpContactModal contactString={rsvp2} />
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg text-gold uppercase tracking-wider">
              Celebration Links
            </h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/register" className="text-champagne/80 hover:text-gold transition">
                  Register to attend
                </Link>
              </li>
              <li>
                <Link href="/#programme" className="text-champagne/80 hover:text-gold transition">
                  Wedding Programme
                </Link>
              </li>
              <li>
                <Link href="/#colour-theme" className="text-champagne/80 hover:text-gold transition">
                  Colour of the Day
                </Link>
              </li>
              <li>
                <Link href="/#gifting" className="text-champagne/80 hover:text-gold transition">
                  Gifting &amp; Donations
                </Link>
              </li>
              <li>
                <Link href="/invitation" className="text-champagne/80 hover:text-gold transition">
                  Retrieve my invitation
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-champagne/80 hover:text-gold transition">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="ornament-divider mt-14 text-xs tracking-[0.35em] text-gold/70">
          ÌFẸ́ NI GBOGBO RẸ̀ &bull; LOVE IS EVERYTHING
        </div>

        <p className="mt-6 text-center text-xs text-champagne/50">
          &copy; 2026 DELOUS &rsquo;26. Celebrating {EVENT.couple}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
