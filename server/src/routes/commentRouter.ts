import express from 'express';
import { authentication } from '../middlewares/authMiddleware';
import { createComment, createCommentValidation, deleteComment } from '../controllers/commentControllers';

const commentRouter = express.Router();

commentRouter.post(
	'/:postId',
	authentication,
	createCommentValidation,
	createComment
);

commentRouter.delete(
	'/:commentId',
	authentication,
	deleteComment
);

export default commentRouter;