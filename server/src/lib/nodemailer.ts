import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

const isTest = process.env.NODE_ENV === "test";

export const transporterOptions: SMTPTransport.Options = isTest
  ? {
      host: process.env.SMTP_HOST_TEST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASS,
      },
    }
  : {
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.SMTP_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      },
    };

export const createTransporter = () =>
  nodemailer.createTransport(transporterOptions);
