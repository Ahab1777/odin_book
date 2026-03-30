import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { body, ValidationChain, validationResult } from "express-validator";
import gravatarUrl from "../lib/gravatar";

export const createPostValidation: ValidationChain[] = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 24 })
    .withMessage("Title must be between 3 and 24 characters"),
  body("content")
    .trim()
    .isLength({ min: 10, max: 240 })
    .withMessage("Content must be between 10 and 240 characters"),
];

export async function createPost(req: Request, res: Response): Promise<void> {
  const { title, content } = req.body;
  const { userId } = req.user as { userId: string };

  //Validate user info
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    res.status(400).json({
      errors: validationErrors.array(),
    });
    return;
  }

  //Create post in DB
  const post = await prisma.post.create({
    data: {
      title,
      userId,
      content,
    },
  });

  res.status(201).json({
    id: post.id,
    title: post.title,
    content: post.content,
    userId: post.userId,
    createdAt: post.createdAt,
  });
}

export async function deletePost(req: Request, res: Response): Promise<void> {
  const postId = req.params.postId as string;
  const { userId } = req.user as { userId: string };

  // Check if post exists and user owns it
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  if (post.userId !== userId) {
    res.status(403).json({ error: "Unauthorized to delete this post" });
    return;
  }

  // Delete the post
  await prisma.post.delete({
    where: { id: postId },
  });

  res.status(200).json({ message: "Post deleted successfully" });
}

export async function updatePost(req: Request, res: Response): Promise<void> {
  const postId = req.params.postId as string;
  const { title, content } = req.body;
  const { userId } = req.user as { userId: string };

  // Validate incoming data using the same rules as createPost
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    res.status(400).json({
      errors: validationErrors.array(),
    });
    return;
  }

  // Check if post exists and user owns it
  const existingPost = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!existingPost) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  if (existingPost.userId !== userId) {
    res.status(403).json({ error: "Unauthorized to update this post" });
    return;
  }

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      title,
      content,
    },
  });

  res.status(200).json({
    id: updatedPost.id,
    title: updatedPost.title,
    content: updatedPost.content,
    userId: updatedPost.userId,
    createdAt: updatedPost.createdAt,
    updatedAt: updatedPost.updatedAt,
  });
}

export async function getPost(req: Request, res: Response): Promise<void> {
  const postId = req.params.postId as string;

  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          email: true,
        },
      },
      comments: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
      likes: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      },
    },
  });

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  const email = post.user?.email as string | undefined;
  const avatar = email ? gravatarUrl(email) : undefined;

  res.status(200).json({
    id: post.id,
    title: post.title,
    content: post.content,
    userId: post.userId,
    user: post.user
      ? {
          id: post.user.id,
          username: post.user.username,
          avatar,
        }
      : post.user,
    comments: post.comments,
    likes: post.likes,
    createdAt: post.createdAt,
  });
}

export async function getPostIndex(req: Request, res: Response): Promise<void> {
  const { userId } = req.user as { userId: string };

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  // Load user + posts + friends' posts, including comments & likes
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: {
        include: {
          user: { select: { id: true, username: true, email: true } },
          comments: {
            include: { user: { select: { id: true, username: true } } },
          },
          likes: {
            include: { user: { select: { id: true, username: true } } },
          },
        },
      },
      friendshipsAsUser1: {
        include: {
          user2: {
            include: {
              posts: {
                include: {
                  user: { select: { id: true, username: true, email: true } },
                  comments: {
                    include: { user: { select: { id: true, username: true } } },
                  },
                  likes: {
                    include: { user: { select: { id: true, username: true } } },
                  },
                },
              },
            },
          },
        },
      },
      friendshipsAsUser2: {
        include: {
          user1: {
            include: {
              posts: {
                include: {
                  user: { select: { id: true, username: true, email: true } },
                  comments: {
                    include: { user: { select: { id: true, username: true } } },
                  },
                  likes: {
                    include: { user: { select: { id: true, username: true } } },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  // Collect all posts
  const allPosts = [...(user.posts || [])];

  user.friendshipsAsUser1?.forEach((f) => {
    if (f.user2?.posts) allPosts.push(...f.user2.posts);
  });
  user.friendshipsAsUser2?.forEach((f) => {
    if (f.user1?.posts) allPosts.push(...f.user1.posts);
  });

  // Add avatar for each post.user and keep comments/likes intact
  const postsWithAvatars = allPosts.map((post: any) => {
    const email = post.user?.email as string | undefined;
    const avatar = email ? gravatarUrl(email) : undefined;

    return {
      ...post,
      user: post.user
        ? {
            id: post.user.id,
            username: post.user.username,
            avatar,
          }
        : post.user,
      // comments and likes are already present from the query
    };
  });

  // Sort and paginate
  postsWithAvatars.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const totalPosts = postsWithAvatars.length;
  const totalPages = Math.max(1, Math.ceil(totalPosts / limit));
  const paginatedPosts = postsWithAvatars.slice(offset, offset + limit);
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  res.status(200).json({
    posts: paginatedPosts,
    pagination: {
      currentPage: page,
      totalPages,
      totalPosts,
      hasNextPage,
      hasPreviousPage,
    },
  });
}

export async function getUserPosts(req: Request, res: Response): Promise<void> {
  const { userId } = req.user as { userId: string };

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  // Fetch paginated posts
  const posts = await prisma.post.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: limit,
    include: {
      comments: true,
      likes: true,
    },
  });

  // Count total posts
  const totalPosts = await prisma.post.count({
    where: { userId },
  });

  // Calculate total pages
  const totalPages = Math.ceil(totalPosts / limit);

  // Calculate hasNextPage and hasPreviousPage
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  res.status(200).json({
    posts,
    pagination: {
      currentPage: page,
      totalPages,
      totalPosts,
      hasNextPage,
      hasPreviousPage,
    },
  });
}

export async function getPostsTargetUser(
  req: Request,
  res: Response,
): Promise<void> {
  const userId = req.params.userId as string;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  // Fetch paginated posts
  const posts = await prisma.post.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: limit,
    include: {
      comments: true,
      likes: true,
    },
  });

  // Count total posts
  const totalPosts = await prisma.post.count({
    where: { userId },
  });

  // Calculate total pages
  const totalPages = Math.ceil(totalPosts / limit);

  // Calculate hasNextPage and hasPreviousPage
  const hasNextPage = page < totalPages;
  const hasPreviousPage = page > 1;

  res.status(200).json({
    posts,
    pagination: {
      currentPage: page,
      totalPages,
      totalPosts,
      hasNextPage,
      hasPreviousPage,
    },
  });
}
