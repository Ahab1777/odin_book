import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

type JWTUser = {
    userId: string;
    email: string;
    iat: number;
    exp: number;
};

export const authentication = (req: Request, res: Response, next: NextFunction) => {
    //Get token form header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        return res.status(500).json({ error: 'Missing JWT_SECRET environment variable' });

    }    
  
    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
        return res.status(403).json({ error: 'Invalid or expired token' });
        }
    
        // Attach user info to request
        req.user = user as JWTUser;
        next();
    });
}