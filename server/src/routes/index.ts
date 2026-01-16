import authRouter from "./authRouter"
import postRouter from "./postRouter"
import userRouter from "./userRouter"


export const routes = {
    auth: authRouter,
    post: postRouter,
    user: userRouter
}