import express from 'express';
import { signup, validation } from '../controllers/authControllers'

const authRouter = express.Router();


authRouter.post('/', validation, signup);

export default authRouter;