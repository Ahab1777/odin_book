import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { friendsService } from "../services/friendsServices";

export async function getWhoCurrentUserFollows(
  req: Request,
  res: Response,
): Promise<void> {
  const { userId } = req.user as { userId: string };

  const following = await friendsService.currentUserFollowing(userId);

  res.status(200).json({ following });
}

export async function getWhoFollowsCurrentUser(
  req: Request,
  res: Response,
): Promise<void> {
  const { userId } = req.user as { userId: string };

  const followers = await friendsService.currentUserFollowedBy(userId);

  res.status(200).json({ followers });
}

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

  // Check if already friends
  const existingFriendship = await prisma.friend.findUnique({
    where: {
      userId_friendId: {
        userId,
        friendId,
      },
    },
  });

  if (existingFriendship) {
    res.status(400).json({ error: "Already friends with this user" });
    return;
  }

  // Check if friendship already requested
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

  if (existingRequest!) {
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
  });
}

export async function befriend(req: Request, res: Response): Promise<void> {
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

  // Check if already friends
  const existingFriendship = await prisma.friend.findUnique({
    where: {
      userId_friendId: {
        userId,
        friendId,
      },
    },
  });

  if (existingFriendship) {
    res.status(400).json({ error: "Already friends with this user" });
    return;
  }

  // Add as friends
  const friendship = await prisma.friend.create({
    data: {
      userId,
      friendId,
    },
  });

  res.status(201).json({
    id: friendship.id,
    userId: friendship.userId,
    friendId: friendship.friendId,
    createdAt: friendship.createdAt,
  });
}

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

  // Check if they are friends
  const existingFriendship = await prisma.friend.findUnique({
    where: {
      userId_friendId: {
        userId,
        friendId,
      },
    },
  });

  if (!existingFriendship) {
    res.status(400).json({ error: "You are not friends with this user" });
    return;
  }

  // Remove friendship
  await prisma.friend.delete({
    where: {
      userId_friendId: {
        userId,
        friendId,
      },
    },
  });

  res.status(200).json({ message: "Successfully unfriended user" });
}
