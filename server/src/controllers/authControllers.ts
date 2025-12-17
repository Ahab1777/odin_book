import { Request, Response } from 'express';
import { prisma } from '../lib/prisma'
import { body, validationResult } from 'express-validator'
import { userService } from '../services/userServices';

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
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
        
    }
}