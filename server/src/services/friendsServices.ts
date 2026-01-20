import { prisma } from "../lib/prisma";

export const friendsService = {
  async currentUserFollowing(currentUserId: string) {
    const following = await prisma.friend.findMany({
      where: { userId: currentUserId },
      include: { friend: true }, // returns the followed User
    });

    return following.map((f) => f.friend);
  },

  async currentUserFollowedBy(currentUserId: string) {
    const followers = await prisma.friend.findMany({
      where: { friendId: currentUserId },
      include: { user: true },
    });

    return followers.map((f) => f.user);
  },

  async mutualFriendships(currentUserId: string) {
    const mutual = await prisma.friend.findMany({
      where: {
        userId: currentUserId,
        friend: {
          friends: {
            some: { friendId: currentUserId },
          },
        },
      },
      include: { friend: true },
    });

    return mutual.map((f) => f.friend);
  },

  async unknownUsers(currentUserId: string) {
    const unknownUsers = await prisma.user.findMany({
      where: {
        id: { not: currentUserId },
        friends: {
          none: { friendId: currentUserId }, // I do not follow them
        },
        friendOf: {
          none: { userId: currentUserId }, // they do not follow me
        },
      },
    });
      
      return unknownUsers;
  },
};
