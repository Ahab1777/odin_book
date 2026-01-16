import express from 'express';
import { authentication } from '../middlewares/authMiddleware';
import { befriend } from '../controllers/userControllers';

const userRouter = express.Router()

userRouter.post('/befriend/:userId',
    authentication,
    befriend
)

export default userRouter;