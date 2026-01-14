import express from 'express';
import { authentication } from '../middlewares/authMiddleware';
import { createPost, createPostValidation } from '../controllers/postControllers';


const postRouter = express.Router();

postRouter.post('/create',
    authentication,
    createPostValidation,
    createPost)

export default postRouter;