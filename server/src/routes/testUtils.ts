import express from "express";
import request from "supertest";
import authRouter from "./authRouter";
import { prisma } from "../lib/prisma";
import friendRouter from "./friendRouter";
import type { Response } from "supertest";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", authRouter);
app.use("/friend", friendRouter);

type TestUser = { id: string; token: string };

export async function signupUser(prefix: string): Promise<TestUser> {
  const unique =
    Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

  const res = await request(app)
    .post("/auth/signup")
    .send({
      email: `${prefix}_${unique}@example.com`,
      username: `${prefix}_${unique}`,
      password: "Password1",
    })
    .expect(201);

  return { id: res.body.userId, token: res.body.token };
}

async function createFriendRequest(
  requester: TestUser,
  receiver: TestUser,
): Promise<any> {
  const res = await request(app)
    .post(`/friend/request/${receiver.id}`)
    .set("Authorization", `Bearer ${requester.token}`);

  return res;
}

async function createFriendship(
  requester: TestUser,
  receiver: TestUser,
): Promise<{ requestRes: Response; befriendRes: Response }> {
  const requestRes = await request(app)
    .post(`/friend/request/${receiver.id}`)
    .set("Authorization", `Bearer ${requester.token}`);

  const befriendRes = await request(app)
    .post(`/friend/befriend/${requester.id}`)
    .set("Authorization", `Bearer ${receiver.token}`);

  return {
    requestRes,
    befriendRes,
  };
}

async function unfriend(
  requester: TestUser,
  receiver: TestUser,
): Promise<Response> {
  const res = await request(app)
    .delete(`/friend/unfriend/${receiver.id}`)
    .set("Authorization", `Bearer ${requester.token}`);

  return res;
}
const testUtils = {
  signupUser,
  createFriendRequest,
  createFriendship,
  unfriend,
};

export default testUtils;
