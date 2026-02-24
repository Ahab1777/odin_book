import express from "express";
import { authentication } from "../middlewares/authMiddleware";
import { getUserProfile } from "../controllers/profileControllers";


const profileRouter = express.Router();

profileRouter.get("/:userId", authentication, getUserProfile)


export default profileRouter;