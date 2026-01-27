import { Request, Response } from "express";
import { body, ValidationChain, validationResult } from "express-validator";
import { prisma } from "../lib/prisma";

export const editBioValidation: ValidationChain[] = [
  body("bio")
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
      where: { userId },
      data: { bio },
      select: { id: true, bio: true },
    });

    res.status(200).json({ profile: updatedUser.bio });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile" });
  }
}

export async function getBio(req: Request, res: Response): Promise<void> {
  const { userId } = req.params as { userId: string };

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { id: true, bio: true },
    });

    if (!profile) {
      res.status(404).json({ message: "Profile not found" });
      return;
    }

    res.status(200).json({ bio: profile.bio });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
}
