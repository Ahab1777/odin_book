import express from 'express';
import { authentication } from '../middlewares/authMiddleware';
import { addLike } from '../controllers/likeControllers';


const likeRouter = express.Router();

likeRouter.post('/:postId',
    authentication,
    addLike
);

export default likeRouter;