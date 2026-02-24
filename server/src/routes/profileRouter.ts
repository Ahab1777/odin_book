import express from "express";
import { authentication } from "../middlewares/authMiddleware";


const profileRouter = express.Router();

profileRouter.get("/:userId", authentication,)


export default profileRouter;