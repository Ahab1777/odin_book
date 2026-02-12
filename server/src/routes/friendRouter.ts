import express from "express";
import { authentication } from "../middlewares/authMiddleware";
import {
  befriend,
  unfriend,
  getFriendships,
  getUnknownUsers,
  sendFriendRequest,
  getIncomingPendingRequests,
} from "../controllers/friendControllers";

const friendRouter = express.Router();

friendRouter.post("/request/:userId", authentication, sendFriendRequest);

friendRouter.post("/befriend/:userId", authentication, befriend);

friendRouter.delete("/unfriend/:userId", authentication, unfriend);

friendRouter.get("/friendships", authentication, getFriendships);

friendRouter.get("/unknown", authentication, getUnknownUsers);

friendRouter.get(
  "/requests/incoming",
  authentication,
  getIncomingPendingRequests,
);

export default friendRouter;
