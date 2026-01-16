import express from 'express';
import { authentication } from '../middlewares/authMiddleware';
import { addLike, deleteLike } from '../controllers/likeControllers';


const likeRouter = express.Router();

likeRouter.post('/:postId', authentication, addLike);
likeRouter.delete('/:postId', authentication, deleteLike);

export default likeRouter;