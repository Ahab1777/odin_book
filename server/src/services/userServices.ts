import { env } from "node:process";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import { createTransporter } from "../lib/nodemailer";

export const userService = {
  // Get user by email
  async findByEmailForSignUp(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        email: true,
      },
    });
  },

  // Get user by username
  async findByUsernameForSignUp(username: string) {
    return await prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
      },
    });
  },

  //Get username and password for login
  async findByEmailForLogin(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        email: true,
        password: true,
        username: true,
        id: true,
      },
    });
  },

  //Get/create demo user
  async getOrCreateDemoUser() {
    const demoEmail = env.DEMO_USER_EMAIL as string;
    const demoUsername = env.DEMO_USER_USERNAME as string;
    const demoPassword = env.DEMO_USER_PASSWORD as string;

    //Check if environment variables are set
    if (!demoEmail || !demoUsername || !demoPassword) {
      throw new Error(
        "One or more demo user environment variables  are missing",
      );
    }

    //Fetch demoUser, if it exists
    let demoUser = await prisma.user.findUnique({
      where: { email: demoEmail },
    });

    //If demoUser does not exist, create it
    if (!demoUser) {
      const hashedPassword: string = await bcrypt.hash(demoPassword, 10);
      demoUser = await prisma.user.create({
        data: {
          email: demoEmail,
          username: demoUsername,
          password: hashedPassword,
          class: "DEMO",
        },
      });
      //Create profile for demoUser
      await prisma.profile.create({
        data: {
          bio: "I'm just a visitor here =)",
          userId: demoUser.id,
        },
      });
    }

    return {
      id: demoUser.id,
      email: demoUser.email,
      username: demoUser.username,
    };
  },

  //Password recovery
  async sendPasswordResetEmail(
    email: string,
    token: string,
    transporter = createTransporter(),
  ) {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER, // or hard-code a proper from
      to: email,
      subject: "Password reset",
      text: `Use this token: ${token}`,
    });
  },
};
