import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { friendsService } from "../services/friendsServices";
import gravatarUrl from "../lib/gravatar";

export async function getUserProfile(
  req: Request,
  res: Response,
): Promise<void> {
  const { userId } = req.params;

  if (!userId || Array.isArray(userId)) {
    res.status(400).json({
      error: "Missing userId parameter",
    });
    return;
  }

  try {
    //Fetch user info
    const userInfo = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        posts: {
          select: {
            id: true,
            userId: true,
            title: true,
            content: true,
            createdAt: true,
            likes: {
              select: {
                id: true,
                userId: true,
                createdAt: true,
              },
            },
            comments: {
              select: {
                id: true,
                content: true,
                userId: true,
                createdAt: true,
              },
            },
          },
        },
        profile: {
          select: {
            bio: true,
          },
        },
      },
    });

    const page = 1;
    const limit = 10;
    const offset = 0;

    //Fetch user friends
    const userFriends = await friendsService.currentFriendships(
      userId,
      page,
      limit,
      offset,
    );

    if (!userInfo) {
      res.status(404).json({
        error: "User not found",
      });
      return;
    }

    // Generate avatar URL
    const avatar = userInfo.email ? gravatarUrl(userInfo.email) : null;

    //Grab bio
    const bio = userInfo.profile?.bio ? userInfo.profile.bio : "No bio yet";

    res.status(200).json({
      id: userInfo.id,
      username: userInfo.username,
      posts: userInfo.posts,
      friends: userFriends.friends,
      bio,
      avatar,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
