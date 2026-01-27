import { Request, Response } from "express";
import { body, ValidationChain, validationResult } from "express-validator";
import { prisma } from "../lib/prisma";

export const editBioValidation: ValidationChain[] = [
  body("profile")
    .trim()
    .isLength({ max: 250 })
    .withMessage("Maximum bio size is 250 characters"),
];

export async function editBio(req: Request, res: Response): Promise<void> {
    const { userId } = req.user as { userId: string };
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }

    const { bio } = req.body as { bio?: string };


    try {
        const updatedUser = await prisma.profile.update({
            where: { id: userId },
            data: { bio },
            select: { id: true, bio: true },
        });

        res.status(200).json({ profile: updatedUser.bio });
    } catch (error) {
        res.status(500).json({ message: "Failed to update profile" });
    }
}
