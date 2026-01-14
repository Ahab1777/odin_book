import express from 'express';
import { login, loginValidation, signup, signupValidation } from '../controllers/authControllers'

const authRouter = express.Router();


authRouter.post('/signup', signupValidation, signup);
authRouter.post('/login', loginValidation, login);


export default authRouter;