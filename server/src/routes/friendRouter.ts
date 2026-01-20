import express from "express";
import { authentication } from "../middlewares/authMiddleware";
import {
  befriend,
  unfriend,
  getWhoCurrentUserFollows,
  getWhoFollowsCurrentUser,
  getFriendships,
  getUnknownUsers,
} from "../controllers/friendControllers";

const friendRouter = express.Router();

friendRouter.post("/befriend/:userId", authentication, befriend);

friendRouter.delete("/unfriend/:userId", authentication, unfriend);

friendRouter.get("/following", authentication, getWhoCurrentUserFollows);

friendRouter.get("/followers", authentication, getWhoFollowsCurrentUser);

friendRouter.get("/friendships", authentication, getFriendships);

friendRouter.get("/unknown", authentication, getUnknownUsers);

export default friendRouter;
