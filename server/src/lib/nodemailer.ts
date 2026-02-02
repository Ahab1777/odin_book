import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

export const transporterOptions: SMTPTransport.Options = {
  host: process.env.SMTP_HOST_TEST,
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.ETHEREAL_USER,
    pass: process.env.ETHEREAL_PASS,
      
  }
};

export const createTestTransporter = () =>
  nodemailer.createTransport(transporterOptions);
