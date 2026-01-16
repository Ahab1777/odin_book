import express from 'express';
import { authentication } from '../middlewares/authMiddleware';
import { createPost, createPostValidation, deletePost } from '../controllers/postControllers';


const postRouter = express.Router();

postRouter.post('/create',
    authentication,
    createPostValidation,
    createPost
)
postRouter.delete('/:postId',
    authentication,
    deletePost
)

export default postRouter;