import express from "express";
import request from "supertest";
import type { Response } from "supertest";
import authRouter from "../authRouter";
import postRouter from "../postRouter";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", authRouter);
app.use("/post", postRouter);

type TestUser = { id: string; token: string };

async function createPost(
  user: TestUser,
  body: { title: string; content: string; userId?: string },
): Promise<Response> {
  const res = await request(app)
    .post("/post/create")
    .set("Authorization", `Bearer ${user.token}`)
    .send(body);

  return res;
}

async function updatePost(
  user: TestUser,
  postId: string,
  body: { title: string; content: string; userId?: string },
): Promise<Response> {
  const res = await request(app)
    .put(`/post/${postId}`)
    .set("Authorization", `Bearer ${user.token}`)
    .send(body);

  return res;
}

async function deletePost(user: TestUser, postId: string): Promise<Response> {
  const res = await request(app)
    .delete(`/post/${postId}`)
    .set("Authorization", `Bearer ${user.token}`);

  return res;
}

const postTestUtils = {
  createPost,
  updatePost,
  deletePost,
};

export default postTestUtils;
