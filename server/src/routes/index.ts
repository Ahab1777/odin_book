import authRouter from "./authRouter"
import likeRouter from "./likeRouter"
import postRouter from "./postRouter"
import userRouter from "./userRouter"
import commentRouter from "./commentRouter"


export const routes = {
    auth: authRouter,
    post: postRouter,
    user: userRouter,
    like: likeRouter,
    comment: commentRouter
}