import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { tickets } from "@/db/schema";
import { hashToken, qrPayload } from "@/lib/qr/tokens";
import { getSettings } from "@/lib/settings";
import { ADMISSION_NOTICE, EVENT } from "@/lib/constants";
import TicketActions from "@/components/invitation/TicketActions";
import WelcomeConfetti from "@/components/invitation/WelcomeConfetti";

export const metadata = { title: "My Invitation — DELOUS '26" };

export default async function InvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { token } = await params;
  const { welcome } = await searchParams;

  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.tokenHash, hashToken(token)),
    with: { guest: { with: { checkIn: true } } },
  });

  if (!ticket || !ticket.guest) notFound();

  const settings = await getSettings();
  const revoked =
    ticket.status === "revoked" || ticket.guest.status === "revoked";
  const qrDataUrl = revoked
    ? null
    : await QRCode.toDataURL(qrPayload(token), {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 400,
        color: { dark: "#260811", light: "#FAF6EF" },
      });

  return (
    <div className="bg-wine pb-24 pt-28">
      {welcome === "1" && !revoked && <WelcomeConfetti />}
      <div className="mx-auto max-w-md px-5">
        {welcome === "1" && !revoked && (
          <div className="mb-6 rounded-2xl border border-gold/40 bg-burgundy p-5 text-center text-champagne">
            <p className="font-display text-2xl italic text-gold">Ayọ̀ àti ìbùkún!</p>
            <p className="mt-1 text-sm text-champagne/80">
              Your registration is complete. A copy of this invitation has been
              sent to your email — screenshot this page, you will present the QR code
              at the entrance.
            </p>
          </div>
        )}

        {/* Ticket card */}
        <div className="overflow-hidden rounded-3xl bg-ivory shadow-2xl">
          <div className="bg-burgundy px-6 py-8 text-center text-champagne">
            <p className="text-[10px] tracking-[0.5em] text-gold">DIGITAL INVITATION</p>
            <h1 className="gold-text mt-3 font-display text-4xl font-semibold tracking-[0.15em]">
              DELOUS &rsquo;26
            </h1>
            <p className="mt-2 font-display text-lg italic text-champagne/90">
              {EVENT.couple}
            </p>
          </div>

          <div className="px-6 py-7 text-center">
            <p className="text-[10px] tracking-[0.35em] text-rich-black/50">ADMITS</p>
            <p className="mt-1 font-display text-3xl font-semibold text-burgundy">
              {ticket.guest.fullName}
            </p>
            <p className="mt-1 text-xs tracking-[0.2em] text-gold">
              {ticket.guest.attendeeCode}
            </p>

            {revoked ? (
              <div className="mx-auto mt-6 max-w-xs rounded-xl bg-red-50 p-5 text-sm text-red-700">
                This ticket is no longer active. Please contact the organisers
                or retrieve a new invitation.
              </div>
            ) : (
              <div className="mt-6 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrDataUrl!}
                  alt={`QR admission ticket for ${ticket.guest.fullName}`}
                  className="h-56 w-56 rounded-2xl border border-gold/40"
                />
              </div>
            )}

            {ticket.guest.checkIn && (
              <p className="mt-4 inline-block rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700">
                ✓ Checked in at the venue
              </p>
            )}

            <div className="mt-7 grid grid-cols-2 gap-4 border-t border-dashed border-gold/40 pt-6 text-left text-xs">
              <div>
                <p className="text-rich-black/45">DATE</p>
                <p className="mt-0.5 font-medium text-burgundy">{EVENT.dateLabel}</p>
              </div>
              <div>
                <p className="text-rich-black/45">TIME</p>
                <p className="mt-0.5 font-medium text-burgundy">{settings.ceremony_time}</p>
              </div>
              <div>
                <p className="text-rich-black/45">CEREMONY</p>
                <p className="mt-0.5 font-medium text-burgundy">
                  {settings.ceremony_venue}
                </p>
                <p className="text-rich-black/55">{settings.ceremony_address}</p>
              </div>
              <div>
                <p className="text-rich-black/45">RECEPTION</p>
                <p className="mt-0.5 font-medium text-burgundy">
                  {settings.reception_venue}
                </p>
                <p className="text-rich-black/55">{settings.reception_address}</p>
              </div>
              <div className="col-span-2">
                <p className="text-rich-black/45">COLOUR OF THE DAY</p>
                <p className="mt-0.5 font-medium text-burgundy">{settings.dress_code}</p>
              </div>
            </div>
          </div>

          <div className="bg-champagne/60 px-6 py-4 text-center text-[10px] leading-relaxed text-burgundy/80">
            {ADMISSION_NOTICE}
          </div>
        </div>

        <TicketActions />
      </div>
    </div>
  );
}
