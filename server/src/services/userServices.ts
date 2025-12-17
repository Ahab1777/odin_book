import { prisma } from "../lib/prisma";

export const userService = {
  // Get user by email
  async findByEmailForSignUp(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        email: true,
      }
    });
    },

    // Get user by username
  async findByUsernameForSignUp(username: string) {
    return await prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
      }
    });
  },    

}