import authRouter from "./authRouter";
import likeRouter from "./likeRouter";
import postRouter from "./postRouter";
import friendRouter from "./friendRouter";
import commentRouter from "./commentRouter";
import bioRouter from "./bioRouter";

export const routes = {
  auth: authRouter,
  post: postRouter,
  friend: friendRouter,
  like: likeRouter,
  comment: commentRouter,
  bio: bioRouter
};
