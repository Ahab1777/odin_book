import gravatarUrl from "../lib/gravatar";
import { prisma } from "../lib/prisma";

export const friendsService = {

  async currentFriendships(
    userId: string,
    page: number,
    limit: number,
    offset: number,
  ) {
    // Fetch the user's friendships
    const friendships = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        friendshipsAsUser1: { include: { user2: true } },
        friendshipsAsUser2: { include: { user1: true } },
      },
    });

    if (!friendships) {
      return {
        friends: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalFriendships: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
    }

    // Combine all friendships into a single array and add avatar links
    const allFriendshipsWithAvatar = [
      ...friendships.friendshipsAsUser1.map((f) => {
        const avatar = gravatarUrl(f.user2.email);

        return {
          id: f.user2.id,
          username: f.user2.username,
          email: f.user2.email,
          avatar,
        };
      }),
      ...friendships.friendshipsAsUser2.map((f) => {
        const avatar = gravatarUrl(f.user1.email);

        return {
          id: f.user1.id,
          username: f.user1.username,
          email: f.user1.email,
          avatar,
        };
      }),
    ];

    // Total number of friendships
    const totalFriendships = allFriendshipsWithAvatar.length;

    // Paginate the friendships
    const paginatedFriendships = allFriendshipsWithAvatar.slice(
      offset,

      offset + limit,
    );
    
    // Calculate pagination metadata
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(totalFriendships / limit),
      totalFriendships,
      hasNextPage: offset + limit < totalFriendships,
      hasPreviousPage: offset > 0,
    };

    return {
      friends: paginatedFriendships,
      pagination,
    };
  },

  async unknownUsers(
    userId: string,
    limit: number,
    offset: number,
    page: number,
  ) {
    // Fetch the total count of unknown users
    const totalUsers = await prisma.user.count({
      where: {
        AND: [
          { id: { not: userId } }, // Exclude the current user
          {
            OR: [
              { friendshipsAsUser1: { none: { user2Id: userId } } },
              { friendshipsAsUser2: { none: { user1Id: userId } } },
            ],
          },
        ],
      },
    });

    //Fetch paginated unknown users
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
      select: {
        id: true,
        username: true,
        email: true,
      },
      skip: offset,
      take: limit,
      orderBy: { username: "desc" },
    });

    const unknownUsersWithAvatar = unknownUsers.map((user) => {
      const avatar = gravatarUrl(user.email);

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar,
      };
    });

    return {
      unknownUsers: unknownUsersWithAvatar,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNextPage: offset + limit < totalUsers,
        hasPreviousPage: offset > 0,
      },
    };
  },

  async incomingPendingRequests(
    userId: string,
    page: number,
    limit: number,
    offset: number,
  ) {
    // Fetch the total count of pending requests
    const totalPendingRequests = await prisma.friendRequest.count({
      where: {
        receiverId: userId,
        status: "PENDING",
      },
    });

    // Fetch paginated pending requests
    const pendingRequests = await prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: "PENDING",
      },
      include: {
        requester: {
          select: { id: true, username: true, email: true },
        },
      },
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    console.log("🚀 ~ friendsServices.ts:217 ~ pendingRequests:", pendingRequests);


    // Add avatars to pending requests
    const pendingWithAvatar = pendingRequests.map((request) => {
      const avatar = request.requester.email
        ? gravatarUrl(request.requester.email)
        : null;

      return {
          id: request.requester.id,
          username: request.requester.username,
          avatar,
      };
    });

    // Return paginated pending requests and metadata
    return {
      pendingRequests: pendingWithAvatar,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPendingRequests / limit),
        totalPendingRequests,
        hasNextPage: offset + limit < totalPendingRequests,
        hasPreviousPage: offset > 0,
      },
    };
  },
};
