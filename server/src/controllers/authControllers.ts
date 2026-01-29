import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { body, validationResult } from "express-validator";
import { userService } from "../services/userServices";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import gravatarUrl from "../lib/gravatar";
import crypto from "crypto";

//Validation array used as middleware for validating info going through a route
export const signupValidation = [
  body("email")
    .isEmail()
    .withMessage("Invalid e-mail format")
    .normalizeEmail()
    .custom(async (email) => {
      const user = await userService.findByEmailForSignUp(email);
      if (user) throw new Error("Email already registered");
    }),
  body("username")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters")
    .trim()
    .custom(async (username) => {
      const user = await userService.findByUsernameForSignUp(username);
      if (user) throw new Error("Username already taken");
    }),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain an uppercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain a number"),
  body("firstName").optional().trim(),
  body("lastName").optional().trim(),
];

export async function signup(req: Request, res: Response): Promise<void> {
  //Validate user info
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    res.status(400).json({
      errors: validationErrors.array(),
    });
    return;
  }

  const { email, username, password } = req.body;

  //Hash password
  const hashedPassword: string = await bcrypt.hash(password, 10);

  //Create user in DB
  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
    },
  });

  //Generate JWT
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      username: user.username,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" },
  );

  //Create blank profile entry for user
  await prisma.profile.create({
    data: {
      userId: user.id,
    },
  });

  //Fetch Gravatar profile pic
  const avatar: string = gravatarUrl(email);

  res.status(201).json({
    token,
    userId: user.id,
    username: user.username,
    avatar,
  });
}

//Login
export const loginValidation = [
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

export async function login(req: Request, res: Response): Promise<void> {
  const validationErrors = validationResult(req);

  if (!validationErrors.isEmpty()) {
    res.status(400).json({ errors: validationErrors.array() });
    return;
  }

  const { email, password } = req.body;

  try {
    // Find user by email (with password hash)
    const user = await userService.findByEmailForLogin(email);

    if (!user) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Compare plaintext password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        username: user.username,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    //Fetch Gravatar profile pic
    const avatar: string = gravatarUrl(email);

    res.status(200).json({
      token,
      userId: user.id,
      username: user.username,
      email: user.email,
      avatar,
    });
  } catch (error) {
    let message = "An unknown error occurred";

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }

    res.status(500).json({ message });
  }
}

//Demo user
export async function loginDemo(req: Request, res: Response): Promise<void> {
  const { id, email, username } = await userService.getOrCreateDemoUser();

  // Generate JWT token
  const token = jwt.sign(
    {
      userId: id,
      email: email,
      username: username,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "1h" },
  );

  //Fetch Gravatar profile pic
  const avatar: string = gravatarUrl(email);

  res.status(200).json({
    token,
    userId: id,
    username,
    email,
    avatar,
  });
}

export const passwordResetValidation = [
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail()
]


//Password reset
export async function passwordReset(
  req: Request,
  res: Response,
): Promise<void> {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  //Security - If user does not exist, return 200 with nothing
  if (!user) {
    res
      .status(200)
      .json({ message: "SUCCESS - If that email exists, a reset link was sent" });
    return;
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  // TODO: send email with token-based reset link
  await userService.sendPasswordResetEmail(
    email,
    token
  );

  res
    .status(200)
    .json({ message: "SUCCESS - If that email exists, a reset link was sent" });
}
