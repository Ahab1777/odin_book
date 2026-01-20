import express from 'express';
import { authentication } from '../middlewares/authMiddleware';
import { befriend, unfriend } from '../controllers/userControllers';

    // [] getFriendships
    // [] getFollowers
    // [] getFollowedBy
    // [] getUnknownUsers


const userRouter = express.Router()

userRouter.post('/befriend/:userId',
    authentication,
    befriend
)
userRouter.delete('/unfriend/:userId',
    authentication,
    unfriend
)



export default userRouter;