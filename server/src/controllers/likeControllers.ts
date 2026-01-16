import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'


export async function addLike(req: Request, res: Response): Promise<void> {
    try {
        const { postId } = req.params;
        const { userId } = req.user as { userId: string };

        // Verify post exists
        const post = await prisma.post.findUnique({
            where: { id: postId }
        });

        if (!post) {
            res.status(404).json({ error: 'Post not found' });
            return;
        }

        // Create like
        const like = await prisma.like.create({
            data: {
                userId,
                postId
            }
        });

        res.status(201).json({
            id: like.id,
            userId: like.userId,
            postId: like.postId,
            createdAt: like.createdAt
        });
    } catch (error: any) {
        // Handle unique constraint violation (user already liked this post)
        if (error.code === 'P2002') {
            res.status(409).json({ error: 'You have already liked this post' });
            return;
        }
        
        res.status(500).json({ error: 'Failed to add like' });
    }
}

