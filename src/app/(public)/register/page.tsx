import RegistrationForm from "@/components/registration/RegistrationForm";
import { EVENT } from "@/lib/constants";
import Link from "next/link";

export const metadata = { title: "Register — DELOUS '26" };

export default function RegisterPage() {
  return (
    <div className="bg-ivory pb-24 pt-32">
      <div className="mx-auto max-w-2xl px-5">
        <div className="mb-10 text-center">
          <p className="font-display text-2xl italic text-gold">Ẹ káàbọ̀!</p>
          <h1 className="mt-2 font-display text-5xl font-medium text-burgundy">
            Register to Attend
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-rich-black/70">
            Join us for the wedding celebration of {EVENT.couple} on{" "}
            {EVENT.dateLabel}. Complete the form below to receive your personal
            digital invitation and QR admission ticket.
          </p>
        </div>
        <RegistrationForm />
        <p className="mt-6 text-center text-xs text-rich-black/50">
          Already registered?{" "}
          <Link href="/invitation" className="text-burgundy underline underline-offset-2">
            Retrieve your invitation
          </Link>
        </p>
      </div>
    </div>
  );
}
