import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'

export async function befriend(req: Request, res: Response): Promise <void> {
    const { userId: friendId } = req.params;
    const { userId } = req.user as { userId: string };

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
        where: { id: friendId }
    });

    if (!targetUser) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    // Check if already friends
    const existingFriendship = await prisma.friend.findUnique({
        where: {
            userId_friendId: {
                userId,
                friendId
            }
        }
    });

    if (existingFriendship) {
        res.status(400).json({ error: 'Already friends with this user' });
        return;
    }

    // Add as friends
    const friendship = await prisma.friend.create({
        data: {
            userId,
            friendId
        }
    });

    res.status(201).json({
        id: friendship.id,
        userId: friendship.userId,
        friendId: friendship.friendId,
        createdAt: friendship.createdAt
    });
}