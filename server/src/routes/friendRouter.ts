import express from 'express';
import { authentication } from '../middlewares/authMiddleware';
import { befriend, unfriend } from '../controllers/friendControllers';

    // [] getFriendships
    // [] getFollowers
    // [] getFollowedBy
    // [] getUnknownUsers


const friendRouter = express.Router()

friendRouter.post('/befriend/:userId',
    authentication,
    befriend
)
friendRouter.delete('/unfriend/:userId',
    authentication,
    unfriend
)



export default friendRouter;