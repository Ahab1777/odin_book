import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'
import { body, ValidationChain, validationResult } from 'express-validator'


export const createPostValidation: ValidationChain[] = [
    body('title')
        .trim()
        .isLength({ min: 3, max: 24 })
        .withMessage('Title must be between 3 and 24 characters'),
    body('userId')
        .notEmpty()
        .withMessage('User ID is required'),
    body('content')
        .trim()
        .isLength({ min: 10, max: 240 })
        .withMessage('Content must be between 10 and 240 characters')
]

export async function createPost(req: Request, res: Response): Promise<void>{
    const { title, content } = req.body;
    const { userId } = req.user as { userId: string}

    //Validate user info
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        res.status(400).json({
            errors: validationErrors.array()
        });
        return;
    }    

    //Create post in DB
    const post = await prisma.post.create({
        data: {
            title,
            userId,
            content
        }
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
    const { postId } = req.params;
    const { userId } = req.user as { userId: string };

    // Check if post exists and user owns it
    const post = await prisma.post.findUnique({
        where: { id: postId }
    });

    if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
    }

    if (post.userId !== userId) {
        res.status(403).json({ error: 'Unauthorized to delete this post' });
        return;
    }

    // Delete the post
    await prisma.post.delete({
        where: { id: postId }
    });

    res.status(200).json({ message: 'Post deleted successfully' });
}

export async function updatePost(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const { title, content } = req.body;
    const { userId } = req.user as { userId: string };

    // Validate incoming data using the same rules as createPost
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        res.status(400).json({
            errors: validationErrors.array()
        });
        return;
    }

    // Check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
        where: { id: postId }
    });

    if (!existingPost) {
        res.status(404).json({ error: 'Post not found' });
        return;
    }

    if (existingPost.userId !== userId) {
        res.status(403).json({ error: 'Unauthorized to update this post' });
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
    const { postId } = req.params;

    // Check if post exists
    const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
            user: {
                select: {
                    id: true,
                    username: true,
                }
            },
            comments: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                        }
                    }
                }
            },
            likes: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                        }
                    }
                }
            }
        }
    });

    if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
    }

    res.status(200).json({
        id: post.id,
        title: post.title,
        content: post.content,
        userId: post.userId,
        user: post.user,
        comments: post.comments,
        likes: post.likes,
        createdAt: post.createdAt,
    });
}

export async function getPostIndex(req: Request, res: Response): Promise < void> {
    const { userId } = req.user as { userId: string };

    // Get current user with their friends and posts
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            posts: {
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                        }
                    }
                }
            },
            friends: {
                include: {
                    friend: {
                        include: {
                            posts: {
                                include: {
                                    user: {
                                        select: {
                                            id: true,
                                            username: true,
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    // Collect all posts: user's posts + friends' posts
    const allPosts = [...(user.posts || [])];

    // Add posts from users that are friends with current user
    if (user.friends) {
        user.friends.forEach((friendship) => {
            if (friendship.friend.posts) {
                allPosts.push(...friendship.friend.posts);
            }
        });
    }

    // Sort by createdAt in descending order (newest first)
    allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json({
        posts: allPosts
    });
}



