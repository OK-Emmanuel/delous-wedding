import { NextResponse } from "next/server";
import { registrationSchema } from "@/lib/validation/registration";
import { registerGuest } from "@/services/registration.service";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { enqueueAndSend } from "@/lib/email/outbox";
import { registrationConfirmationEmail } from "@/lib/email/templates";
import { getSettings } from "@/lib/settings";

export async function POST(request: Request) {
  const ip = clientIp(request);
  const limited = rateLimit(`register:${ip}`, {
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  const settings = await getSettings();
  if (settings.registration_open !== "true") {
    return NextResponse.json(
      { error: "Registration is currently closed." },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const result = await registerGuest(parsed.data);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    // Email delivery happens after the transaction commits; failures stay
    // queued and never invalidate the registration (PRD §5.4).
    if (result.ticketToken) {
      const invitationUrl = `${appUrl}/invitation/${result.ticketToken}`;
      const email = registrationConfirmationEmail({
        name: parsed.data.fullName,
        attendeeCode: result.attendeeCode,
        invitationUrl,
      });
      await enqueueAndSend({
        guestId: result.guestId,
        toEmail: parsed.data.email,
        template: "registration_confirmation",
        subject: email.subject,
        html: email.html,
        idempotencyKey: `registration:${result.guestId}:${result.ticketToken.slice(0, 8)}`,
      });
    }

    return NextResponse.json({
      ok: true,
      attendeeCode: result.attendeeCode,
      // Guests who already registered keep their original ticket; they can
      // use ticket recovery instead of getting a fresh token here.
      invitationToken: result.ticketToken || null,
      alreadyRegistered: result.alreadyRegistered,
    });
  } catch (err) {
    console.error("registration failed", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
