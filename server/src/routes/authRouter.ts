import express from "express";
import {
  login,
  loginDemo,
  loginValidation,
  passwordReset,
  passwordResetValidation,
  signup,
  signupValidation,
} from "../controllers/authControllers";

const authRouter = express.Router();

authRouter.post("/signup", signupValidation, signup);
authRouter.post("/login", loginValidation, login);
authRouter.post("/demo-login", loginDemo);
authRouter.post("/password-reset", passwordResetValidation, passwordReset);

export default authRouter;
