import express from 'express';
import { authentication } from '../middlewares/authMiddleware';
import { createPost, createPostValidation, deletePost, getPost, getPostIndex } from '../controllers/postControllers';


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
postRouter.get('/index',
    authentication,
    getPostIndex
)
postRouter.get('/:postId',
    getPost
)

export default postRouter;