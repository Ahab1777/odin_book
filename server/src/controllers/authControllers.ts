import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'
import { body, validationResult } from 'express-validator'
import { userService } from '../services/userServices';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

//Validation array used as middleware for validating info going through a route
export const validation = [
    body('email')
        .isEmail().withMessage('Invalid e-mail format')
        .normalizeEmail()
        .custom(async (email) => {
            const user = await userService.findByEmailForSignUp(email);
            if (user) throw new Error('Email already registered');
        }),
    body('username')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
        .trim()
        .custom(async (username) => {
            const user = await userService.findByUsernameForSignUp(username);
            if (user) throw new Error('Username already taken');
        }),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain a number'),
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    ]


export async function signup(req: Request, res: Response): Promise<void>{

    //Validate user info
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        res.status(400).json({
            errors: validationErrors.array()
        });
        return;
    }

    const { email, username, password } = req.body;

    //Hash password
    const hashedPassword: string = await bcrypt.hash(password, 10)

    //Create user in DB
    const user = await prisma.user.create({
        data: {
            email,
            username,
            password: hashedPassword
        }
    });

    //Generate JWT
    const token = jwt.sign(
        {
            userId: user.id,
            email: user.email,
            username: user.username
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
    );

    res.status(201).json({ 
        token, 
        userId: user.id,
        username: user.username 
    });
}