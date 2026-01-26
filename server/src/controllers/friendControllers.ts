import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { friendsService } from "../services/friendsServices";
import { normalizeUserPair } from "../lib/friendship";

// export async function getWhoCurrentUserFollows(
//   req: Request,
//   res: Response,
// ): Promise<void> {
//   const { userId } = req.user as { userId: string };

//   const following = await friendsService.currentUserFollowing(userId);

//   res.status(200).json({ following });
// }

// export async function getWhoFollowsCurrentUser(
//   req: Request,
//   res: Response,
// ): Promise<void> {
//   const { userId } = req.user as { userId: string };

//   const followers = await friendsService.currentUserFollowedBy(userId);

//   res.status(200).json({ followers });
// }

export async function getFriendships(
  req: Request,
  res: Response,
): Promise<void> {
  const { userId } = req.user as { userId: string };

  const friendships = await friendsService.mutualFriendships(userId);

  res.status(200).json({ friendships });
}

export async function getUnknownUsers(
  req: Request,
  res: Response,
): Promise<void> {
  const { userId } = req.user as { userId: string };

  const unknownUsers = await friendsService.unknownUsers(userId);

  res.status(200).json({ unknownUsers });
}
//Done
export async function sendFriendRequest(
  req: Request,
  res: Response,
): Promise<void> {
  const { userId: friendId } = req.params;
  const { userId } = req.user as { userId: string };

  // Check if target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: friendId },
  });

  if (!targetUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }


  //Normalize users for friendship check
  const [user1Id, user2Id] = normalizeUserPair(friendId, userId)

  //Ensure they are friends
  const existingFriendship = await prisma.friendship.findUnique({
    where: {
      user1Id_user2Id: {
        user1Id,
        user2Id,
      },
    },
  });

  if (existingFriendship) {
    res.status(400).json({ error: "Already friends with this user" });
    return;
  }

  // Check if friendship already requested or accepted
  const existingRequest = await prisma.friendRequest.findUnique({
    where: {
      requesterId_receiverId: {
        requesterId: userId,
        receiverId: friendId,
      },
    },
  });

  if (existingRequest && existingRequest.status === "PENDING") {
    res.status(400).json({ error: "request already pending" });
    return;
  }

  if (existingRequest && existingRequest.status === "ACCEPTED") {
    res.status(400).json({ error: "request already accepted" });
    return;
  }

  let request;
  //Check if request need to be created or updated
  if (!existingRequest) {
    // Add pending request
    request = await prisma.friendRequest.create({
      data: {
        requesterId: userId,
        receiverId: friendId,
      },
    });
  } else {
    // Change existing request back to PENDING
    request = await prisma.friendRequest.update({
      where: {
        requesterId_receiverId: {
          requesterId: userId,
          receiverId: friendId,
        },
      },
      data: {
        status: "PENDING",
      },
    });
  }

  res.status(201).json({
    id: request.id,
    requesterId: request.requesterId,
    receiverId: request.receiverId,
    createdAt: request.createdAt,
    status: request.status,
  });
}
//Done
export async function befriend(req: Request, res: Response): Promise<void> {
  // :userId is the one who sent the request (requester)
  const { userId: requesterId } = req.params;
  // current logged-in user is the receiver
  const { userId: receiverId } = req.user as { userId: string };

  // Confirm request exists
  const existingRequest = await prisma.friendRequest.findUnique({
    where: {
      requesterId_receiverId: {
        requesterId,
        receiverId,
      },
    },
  });

  if (!existingRequest || existingRequest.status !== "PENDING") {
    res.status(400).json({ error: "no pending friend request from this user" });
    return;
  }

  //Normalize user for db
  const [user1Id, user2Id] = normalizeUserPair(requesterId, receiverId);

  //Ensure they are not already friends
  const existingFriendship = await prisma.friendship.findUnique({
    where: {
      user1Id_user2Id: {
        user1Id,
        user2Id,
      },
    },
  });

  if (existingFriendship) {
    res.status(400).json({ error: "already friends" });
    return;
  }

  // Accept the request + create friendship atomically
  const [updatedRequest, friendship] = await prisma.$transaction([
    prisma.friendRequest.update({
      where: { id: existingRequest.id },
      data: {
        status: "ACCEPTED",
        respondedAt: new Date(),
      },
    }),
    prisma.friendship.create({
      data: {
        user1Id,
        user2Id,
      },
    }),
  ]);

  res.status(201).json({
    id: friendship.id,
    user1Id: friendship.user1Id,
    user2Id: friendship.user2Id,
    createdAt: friendship.createdAt,
    requestStatus: updatedRequest.status,
  });
}
//Done
export async function unfriend(req: Request, res: Response): Promise<void> {
  const { userId: friendId } = req.params;
  const { userId } = req.user as { userId: string };

  // Check if target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: friendId },
  });

  if (!targetUser) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  //Normalize user for friendship check
  const [user1Id, user2Id] = normalizeUserPair(friendId, userId)

  //Ensure they are friends
  const existingFriendship = await prisma.friendship.findUnique({
    where: {
      user1Id_user2Id: {
        user1Id,
        user2Id,
      },
    },
  });

  if (!existingFriendship) {
    res.status(400).json({ error: "You are not friends with this user" });
    return;
  }

  // Remove friendship
  await prisma.friendship.delete({
    where: {
      user1Id_user2Id: {
        user1Id,
        user2Id,
      },
    },
  });

  res.status(200).json({ message: "Successfully unfriended user" });
}
