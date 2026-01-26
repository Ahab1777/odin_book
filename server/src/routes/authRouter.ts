import express from "express";
import {
  login,
  loginDemo,
  loginValidation,
  signup,
  signupValidation,
} from "../controllers/authControllers";

const authRouter = express.Router();

authRouter.post("/signup", signupValidation, signup);
authRouter.post("/login", loginValidation, login);
authRouter.post("/demo-login", loginDemo);

export default authRouter;
