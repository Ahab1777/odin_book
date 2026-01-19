import { Request, Response } from 'express';
import { body, ValidationChain, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';

export const createCommentValidation: ValidationChain[] = [
	body('content')
		.trim()
		.isLength({ min: 1, max: 60 })
		.withMessage('Comment must be between 1 and 60 characters')
];

export async function createComment(req: Request, res: Response): Promise<void>{
    const { postId } = req.params;
    const { content } = req.body;
    const { userId } = req.user as { userId: string}

    //Validate comment
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        res.status(400).json({
            errors: validationErrors.array()
        });
        return;
    };
    
    //Create comment in DB
    const comment = await prisma.comment.create({
        data: {
            content,
            userId,
            postId
        }
    });

    res.status(201).json({
        id: comment.id,
        content: comment.content,
        postId: comment.postId,
        userId: comment.userId,
        createdAt: comment.createdAt
    })
}

export async function deleteComment(req: Request, res: Response): Promise<void> {
    const { commentId } = req.params;
    const { userId } = req.user as { userId: string };

    // Check if comment exists and user owns it
    const comment = await prisma.comment.findUnique({
        where: { id: commentId }
    });

    if (!comment) {
        res.status(404).json({ error: 'Comment not found' });
        return;
    }

    if (comment.userId !== userId) {
        res.status(403).json({ error: 'Unauthorized to delete this comment' });
        return;
    }

    await prisma.comment.delete({
        where: { id: commentId }
    });

    res.status(200).json({ message: 'Comment deleted successfully' });
}

