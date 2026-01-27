import { Request, Response } from 'express';
import { body, ValidationChain, validationResult } from 'express-validator';
import { prisma } from '../lib/prisma';


export const editProfileValidation: ValidationChain[] = [
    body('profile')
        .trim()
        .isLength({ max: 250 })
        .withMessage('Maximum profile size is 250 characters')
];

export async function editProfile