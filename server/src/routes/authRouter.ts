import express from "express";
import {
  login,
  loginDemo,
  loginValidation,
  passwordChange,
  passwordChangeValidation,
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
authRouter.post('/password-change', passwordChangeValidation, passwordChange)

export default authRouter;
