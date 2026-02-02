import { Resend } from "resend";
import { createTestTransporter } from "./nodemailer";

const resend = new Resend(process.env.RESEND_API_KEY);
const isTest = process.env.NODE_ENV === "test";

export async function sendResetEmail(email: string, token: string) {
  const host = process.env.HOST ?? "localhost";
  const port = process.env.PORT ?? "9001";

  if (isTest) {
    const transporter = createTestTransporter();
    await transporter.sendMail({
      from: process.env.ETHEREAL_USER,
      to: email,
      subject: "Password reset request",
      html: `<a href="http://${host}:${port}/auth/password-reset/${token}">Reset Password</a>
      <div>This is you token. Copy and paste into password reset page:</div>
      <div>TOKEN -> ${token}</div>`,
    });
  } else {
    await resend.emails.send({
      from: "Odin Book <onboarding@resend.dev>",
      to: email,
      subject: "Reset Your Password",
      html: `<a href="http://${host}:${port}/auth/password-reset/${token}">Reset Password</a>
      <div>This is you token. Copy and paste into password reset page:</div>
      <div>TOKEN -> ${token}</div>`,
    });
  }
}
