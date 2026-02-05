import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function addLike(req: Request, res: Response): Promise<void> {
  try {
    const postId = req.params.postId as string;
    const { userId } = req.user as { userId: string };

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    // Create like
    const like = await prisma.like.create({
      data: {
        userId,
        postId,
      },
    });

    res.status(201).json({
      id: like.id,
      userId: like.userId,
      postId: like.postId,
      createdAt: like.createdAt,
    });
  } catch (error: any) {
    // Handle unique constraint violation (user already liked this post)
    if (error.code === "P2002") {
      res.status(409).json({ error: "You have already liked this post" });
      return;
    }

    res.status(500).json({ error: "Failed to add like" });
  }
}

export async function deleteLike(req: Request, res: Response): Promise<void> {
  try {
    const postId = req.params.postId as string;
    const { userId } = req.user as { userId: string };

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    // Try to delete the like for this user/post
    const deleted = await prisma.like.deleteMany({
      where: { userId, postId },
    });

    if (deleted.count === 0) {
      res.status(404).json({ error: "Like not found" });
      return;
    }

    res.status(200).json({
      message: "Like removed successfully",
      postId,
      userId,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove like" });
  }
}
