import { env } from "node:process";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import { normalizeAppEmail } from "../lib/email";
import { sendResetEmail } from "../lib/resend";

export const userService = {
  // Get user by email
  async findByEmailForSignUp(email: string) {
    const normalizedEmail = normalizeAppEmail(email);
    return await prisma.user.findUnique({
      where: { email: normalizedEmail },
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
    const normalizedEmail = normalizeAppEmail(email);
    return await prisma.user.findUnique({
      where: { email: normalizedEmail },
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

    const normalizedEmail = normalizeAppEmail(demoEmail);

    //Fetch demoUser, if it exists
    let demoUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    //If demoUser does not exist, create it
    if (!demoUser) {
      const hashedPassword: string = await bcrypt.hash(demoPassword, 10);
      demoUser = await prisma.user.create({
        data: {
          email: normalizedEmail,
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
    resetId: string
  ) {
    try {
      await sendResetEmail(email, token, resetId);
    } catch (err) {
      console.error("Failed to send reset email", err);
    }
  },
};
