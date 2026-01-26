import { prisma } from "../lib/prisma";

export const friendsService = {
  async currentFriendships(userId: string) {
    const friendships = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        friendshipsAsUser1: { include: { user2: true } },
        friendshipsAsUser2: { include: { user1: true } },
      },
    });

    if (!friendships) {
      return [];
    }

    return [
      ...friendships.friendshipsAsUser1.map((f) => f.user2),
      ...friendships.friendshipsAsUser2.map((f) => f.user1),
    ];
  },

  // async currentUserFollowedBy(currentUserId: string) {
  //   const userWithFriendships = await prisma.user.findUnique({
  //     where: { id: currentUserId },
  //     include: {
  //       friendshipsAsUser1: { include: { user2: true } },
  //       friendshipsAsUser2: { include: { user1: true } },
  //     },
  //   });

  //   if (!userWithFriendships) {
  //     return [];
  //   }

  //   return [
  //     ...userWithFriendships.friendshipsAsUser1.map((f) => f.user2),
  //     ...userWithFriendships.friendshipsAsUser2.map((f) => f.user1),
  //   ];
  // },

  // async mutualFriendships(currentUserId: string) {
  //   const userWithFriendships = await prisma.user.findUnique({
  //     where: { id: currentUserId },
  //     include: {
  //       friendshipsAsUser1: { include: { user2: true } },
  //       friendshipsAsUser2: { include: { user1: true } },
  //     },
  //   });

  //   if (!userWithFriendships) {
  //     return [];
  //   }

  //   return [
  //     ...userWithFriendships.friendshipsAsUser1.map((f) => f.user2),
  //     ...userWithFriendships.friendshipsAsUser2.map((f) => f.user1),
  //   ];
  // },

  async unknownUsers(userId: string) {
    const unknownUsers = await prisma.user.findMany({
      where: {
        id: { not: userId },
        friendshipsAsUser1: {
          none: { user2Id: userId },
        },
        friendshipsAsUser2: {
          none: { user1Id: userId },
        },
      },
    });

    return unknownUsers;
  },
};
