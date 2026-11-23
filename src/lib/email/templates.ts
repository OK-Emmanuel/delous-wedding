import { ADMISSION_NOTICE, EVENT } from "@/lib/constants";

const styles = {
  burgundy: "#541323",
  wine: "#260811",
  gold: "#C6A15B",
  champagne: "#F2E7D4",
  ivory: "#FAF6EF",
};

function shell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:${styles.ivory};font-family:Georgia,'Times New Roman',serif;color:${styles.wine};">
    <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
      <div style="background:${styles.burgundy};color:${styles.champagne};text-align:center;padding:32px 24px;border-radius:12px 12px 0 0;">
        <div style="font-size:12px;letter-spacing:4px;color:${styles.gold};">E KÁÀBỌ̀ — WELCOME</div>
        <h1 style="margin:12px 0 4px;font-size:30px;letter-spacing:2px;">${EVENT.tag}</h1>
        <div style="font-size:14px;color:${styles.champagne};">${EVENT.couple}</div>
        <div style="font-size:12px;margin-top:6px;color:${styles.gold};">${EVENT.dateLabel} · Lagos, Nigeria</div>
      </div>
      <div style="background:#ffffff;padding:32px 28px;border:1px solid ${styles.champagne};border-top:none;">
        <h2 style="margin-top:0;color:${styles.burgundy};font-size:20px;">${title}</h2>
        ${body}
      </div>
      <div style="background:${styles.wine};color:${styles.champagne};text-align:center;padding:16px;border-radius:0 0 12px 12px;font-size:12px;">
        Ìfẹ́ ni gbogbo rẹ̀ — Love is everything.<br/>
        ${EVENT.tag} · <strong>${EVENT.couple}</strong>.
      </div>
    </div>
  </body>
</html>`;
}

function button(href: string, label: string): string {
  return `<p style="text-align:center;margin:28px 0;">
    <a href="${href}" style="background:${styles.burgundy};color:${styles.champagne};text-decoration:none;padding:14px 32px;border-radius:999px;font-size:15px;letter-spacing:1px;display:inline-block;">${label}</a>
  </p>`;
}

const notice = `<p style="font-size:12px;color:#8a6d4b;border:1px solid ${styles.champagne};background:${styles.ivory};padding:12px;border-radius:8px;">${ADMISSION_NOTICE}</p>`;

export function registrationConfirmationEmail(params: {
  name: string;
  attendeeCode: string;
  invitationUrl: string;
}) {
  return {
    subject: `Your DELOUS '26 registration is confirmed — ${params.attendeeCode}`,
    html: shell(
      `Ayọ̀ àti ìbùkún, ${params.name}!`,
      `<p>Thank you for choosing to celebrate with us. We genuinely appreciate your presence and support</p>
       <p>Your attendee ID is <strong>${params.attendeeCode}</strong>.</p>
       <p>Your personal digital invitation and QR admission ticket are ready:</p>
       ${button(params.invitationUrl, "View My Invitation")}
       <p style="font-size:13px;color:#555;">Keep this email safe — you will present the QR code on your invitation at the entrance on the wedding day.</p>
       ${notice}`,
    ),
  };
}

export function invitationResendEmail(params: {
  name: string;
  attendeeCode: string;
  invitationUrl: string;
}) {
  return {
    subject: `Your DELOUS '26 invitation — ${params.attendeeCode}`,
    html: shell(
      `Your invitation, ${params.name}`,
      `<p>Here is your personal digital invitation to <strong>${EVENT.tag}</strong>.</p>
       ${button(params.invitationUrl, "Open My Invitation")}
       ${notice}`,
    ),
  };
}

export function otpEmail(params: { name: string; code: string }) {
  return {
    subject: `Your DELOUS '26 verification code`,
    html: shell(
      `Verification code`,
      `<p>Hello ${params.name}, use this one-time code to retrieve your invitation. It expires in 15 minutes.</p>
       <p style="text-align:center;font-size:34px;letter-spacing:10px;color:${styles.burgundy};font-weight:bold;">${params.code}</p>
       <p style="font-size:13px;color:#555;">If you did not request this code, you can ignore this email.</p>`,
    ),
  };
}
