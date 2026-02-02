import { Resend } from "resend";
import { createTestTransporter } from "./nodemailer";

const resend = new Resend(process.env.RESEND_API_KEY);
const isTest = process.env.NODE_ENV === "test";

export async function sendResetEmail(email: string, token: string, resetId: string) {
  const host = process.env.HOST ?? "localhost";
  const port = process.env.PORT ?? "9001";

  const resetUrl = isTest ? `${host}:${port}` : process.env.FRONTEND_URL; 


  if (isTest) {
    const transporter = createTestTransporter();
    await transporter.sendMail({
      from: process.env.ETHEREAL_USER,
      to: email,
      subject: "Password reset request",
      html: `<a href="http://${resetUrl}/auth/password-reset/${resetId}/${token}">Reset Password</a>
      <div>This is you token. Copy and paste into password reset page:</div>
      <div>TOKEN -> ${token}</div>`,
    });
  } else {
    await resend.emails.send({
      from: "Odin Book <onboarding@resend.dev>",
      to: email,
      subject: "Reset Your Password",
      html: `<a href="http://${resetUrl}/auth/password-reset/${resetId}/${token}">Reset Password</a>
      <div>This is you token. Copy and paste into password reset page:</div>
      <div>TOKEN -> ${token}</div>`,
    });
  }
}
