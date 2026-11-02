"use client";

export default function TicketActions() {
  return (
    <div className="no-print mt-6 flex justify-center gap-3">
      <button
        onClick={() => window.print()}
        className="rounded-full border border-gold/60 px-6 py-2.5 text-sm text-gold transition hover:bg-gold hover:text-wine"
      >
        Print / Save as PDF
      </button>
      <button
        onClick={async () => {
          try {
            await navigator.share({
              title: "My DELOUS '26 Invitation",
              url: window.location.href.split("?")[0],
            });
          } catch {
            await navigator.clipboard.writeText(
              window.location.href.split("?")[0],
            );
            alert("Invitation link copied to clipboard");
          }
        }}
        className="rounded-full border border-champagne/40 px-6 py-2.5 text-sm text-champagne/80 transition hover:border-gold hover:text-gold"
      >
        Share / Copy Link
      </button>
    </div>
  );
}
