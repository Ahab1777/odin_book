import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

export const transporterOptions: SMTPTransport.Options = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user:
      process.env.NODE_ENV === "test"
        ? process.env.ETHEREAL_USER
        : process.env.SMTP_USER,
    pass:
      process.env.NODE_ENV === "test"
        ? process.env.ETHEREAL_PASS
        : process.env.SMTP_PASS,
  },
};

export const createTransporter = () =>
  nodemailer.createTransport(transporterOptions);
