declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                email: string;
                iat: number;
                exp: number;
            };
        }
    }
}

interface UserInformation {
    userId: string;
    email: string;
    username: string;
}

export {}