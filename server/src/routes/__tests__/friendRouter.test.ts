import express from "express";
import request from "supertest";
import authRouter from "../authRouter";
import { prisma } from "../../lib/prisma";
import friendRouter from "../friendRouter";
import friendUtils from "../testUtils/friendUtils";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", authRouter);
app.use("/friend", friendRouter);

// FriendRequest tests
test("successfully create a friend request", async () => {
  const requester = await friendUtils.signupUser("req");
  const receiver = await friendUtils.signupUser("rec");

  const res = await friendUtils.createFriendRequest(requester, receiver);

  expect(res.status).toBe(201);

  expect(res.body.requesterId).toBe(requester.id);
  expect(res.body.receiverId).toBe(receiver.id);
  expect(res.body.status).toBe("PENDING");
});

test("deny friend request when there is already a pending request", async () => {
  const requester = await friendUtils.signupUser("req");
  const receiver = await friendUtils.signupUser("rec");

  //Create pendingRequest
  const pendingRequest = await friendUtils.createFriendRequest(
    requester,
    receiver,
  );
  expect(pendingRequest.body.status).toBe("PENDING");
  expect(pendingRequest.status).toBe(201);

  //Make request again
  const repeatedRequest = await friendUtils.createFriendRequest(
    requester,
    receiver,
  );

  expect(repeatedRequest.status).toBe(400);
  expect(repeatedRequest.body.error).toBe("request already pending");
});

// Befriend (accept request) tests
test("successfully accept a friend request and create friendship", async () => {
  const requester = await friendUtils.signupUser("req");
  const receiver = await friendUtils.signupUser("rec");

  const { requestRes, befriendRes } = await friendUtils.createFriendship(
    requester,
    receiver,
  );

  expect(requestRes.status).toBe(201);
  expect(befriendRes.status).toBe(201);
});

test("deny befriend when there is no pending friend request from the given user", async () => {
  const requester = await friendUtils.signupUser("bef_nopend_req");
  const receiver = await friendUtils.signupUser("bef_nopend_rec");

  const res = await friendUtils.befriend(requester, receiver);

  expect(res.status).toBe(400);

  expect(res.body.error).toBeDefined();
  expect(res.body.error).toBe("no pending friend request from this user");
});

test("deny befriend when trying to accept an already accepted request", async () => {
  const requester = await friendUtils.signupUser("bef_dupe_req");
  const receiver = await friendUtils.signupUser("bef_dupe_rec");

  const { requestRes, befriendRes } = await friendUtils.createFriendship(
    requester,
    receiver,
  );

  expect(requestRes.status).toBe(201);
  expect(befriendRes.status).toBe(201);

  const res = await friendUtils.befriend(requester, receiver);

  expect(res.status).toBe(400);

  expect(res.body.error).toBeDefined();
  expect(res.body.error).toBe("no pending friend request from this user");
});

//Unfriend tests
test("successfully unfriend user", async () => {
  const user1 = await friendUtils.signupUser("unf_req");
  const user2 = await friendUtils.signupUser("unf_rec");

  const { requestRes, befriendRes } = await friendUtils.createFriendship(
    user1,
    user2,
  );
  expect(requestRes.status).toBe(201);
  expect(befriendRes.status).toBe(201);

  const res = await friendUtils.unfriend(user1, user2.id);
  expect(res.status).toBe(200);
});

test("deny unfriend - target user does not exist", async () => {
  const user = await friendUtils.signupUser("unf_notfound");
  const fakeUserId = "nonexistent-user-id";

  const res = await friendUtils.unfriend(user, fakeUserId);

  expect(res.status).toBe(404);

  expect(res.body.error).toBeDefined();
  expect(res.body.error).toBe("User not found");
});

test("deny unfriend - not friends with user", async () => {
  const user1 = await friendUtils.signupUser("unf_notfriend1");
  const user2 = await friendUtils.signupUser("unf_notfriend2");

  const res = await friendUtils.unfriend(user1, user2.id);

  expect(res.status).toBe(400);

  expect(res.body.error).toBeDefined();
  expect(res.body.error).toBe("You are not friends with this user");
});

// Get following / followers / friendships / unknown users
test("getWhoCurrentUserFollows returns users current user follows", async () => {
  const current = await friendUtils.signupUser("fol_cur");
  const target = await friendUtils.signupUser("fol_tgt");

  const { requestRes, befriendRes } = await friendUtils.createFriendship(
    current,
    target,
  );
  expect(requestRes.status).toBe(201);
  expect(befriendRes.status).toBe(201);

  const res = await request(app)
    .get("/friend/following")
    .set("Authorization", `Bearer ${current.token}`)
    .expect(200);

  expect(Array.isArray(res.body.following)).toBe(true);
  const ids = res.body.following.map((u: any) => u.id);
  expect(ids).toContain(target.id);
});

test("getWhoFollowsCurrentUser returns users who follow current user", async () => {
  const current = await friendUtils.signupUser("fol2_cur");
  const follower = await friendUtils.signupUser("fol2_fol");

  const { requestRes, befriendRes } = await friendUtils.createFriendship(
    follower,
    current,
  );
  expect(requestRes.status).toBe(201);
  expect(befriendRes.status).toBe(201);

  const res = await request(app)
    .get("/friend/followers")
    .set("Authorization", `Bearer ${current.token}`)
    .expect(200);

  expect(Array.isArray(res.body.followers)).toBe(true);
  const ids = res.body.followers.map((u: any) => u.id);
  expect(ids).toContain(follower.id);
});

test("getFriendships returns only mutual friendships", async () => {
  const userA = await friendUtils.signupUser("mut_a");
  const userB = await friendUtils.signupUser("mut_b");
  const userC = await friendUtils.signupUser("mut_c");

  await friendUtils.createFriendship(userA, userB);
  await friendUtils.createFriendship(userB, userA);
  await friendUtils.createFriendship(userC, userA);

  const res = await request(app)
    .get("/friend/friendships")
    .set("Authorization", `Bearer ${userA.token}`)
    .expect(200);

  expect(Array.isArray(res.body.friendships)).toBe(true);
  const ids = res.body.friendships.map((u: any) => u.id);
  expect(ids).toContain(userB.id);
  expect(ids).not.toContain(userC.id);
});

test("getUnknownUsers returns users with no relation to current user", async () => {
  const current = await friendUtils.signupUser("unk_cur");
  const friend = await friendUtils.signupUser("unk_friend");
  const unknown = await friendUtils.signupUser("unk_unknown");

  await friendUtils.createFriendship(current, friend);

  const res = await request(app)
    .get("/friend/unknown")
    .set("Authorization", `Bearer ${current.token}`)
    .expect(200);

  expect(Array.isArray(res.body.unknownUsers)).toBe(true);
  const ids = res.body.unknownUsers.map((u: any) => u.id);
  expect(ids).toContain(unknown.id);
  expect(ids).not.toContain(friend.id);
  expect(ids).not.toContain(current.id);
});

afterAll(async () => {
  await prisma.$disconnect();
});
