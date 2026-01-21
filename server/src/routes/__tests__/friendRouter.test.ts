import express from "express";
import request from "supertest";
import authRouter from "../authRouter";
import { prisma } from "../../lib/prisma";
import friendRouter from "../friendRouter";
import { createFriendRequest, signupUser } from "../testUtils";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", authRouter);
app.use("/friend", friendRouter);

// FriendRequest tests
test("successfully create a friend request", async () => {
  const requester = await signupUser("req");
  const receiver = await signupUser("rec");

  const res = await request(app)
    .post(`/friend/request/${receiver.id}`)
    .set("Authorization", `Bearer ${requester.token}`)
    .expect(201);

  expect(res.body.requesterId).toBe(requester.id);
  expect(res.body.receiverId).toBe(receiver.id);
  expect(res.body.status).toBe('PENDING');
});

test("deny friend request when there is already a pending request", async () => {
  const requester = await signupUser("req");
  const receiver = await signupUser("rec");

  //Create pendingRequest
  const pendingRequest = await createFriendRequest(
    requester,
    receiver
  );
  expect(pendingRequest.body.status).toBe('PENDING');
  expect(pendingRequest.status).toBe(201);

  //Make request again
  const repeatedRequest = await createFriendRequest(
    requester,
    receiver
  );

  expect(repeatedRequest.status).toBe(400);
  expect(repeatedRequest.body.error).toBe('request already pending');
});

// Befriend (accept request) tests
test("successfully accept a friend request and create friendship", (done: jest.DoneCallback) => {
  const unique1 = Date.now().toString(36);
  const unique2 = (Date.now() + 1).toString(36);

  // Create requester (User1)
  request(app)
    .post("/auth/signup")
    .send({
      email: `bef_req_${unique1}@example.com`,
      username: `bef_req_${unique1}`,
      password: "Password1",
    })
    .expect(201)
    .end((err, signupRes1) => {
      if (err) return done(err);

      const token1 = signupRes1.body.token;
      const userId1 = signupRes1.body.userId;

      // Create receiver (User2)
      request(app)
        .post("/auth/signup")
        .send({
          email: `bef_rec_${unique2}@example.com`,
          username: `bef_rec_${unique2}`,
          password: "Password1",
        })
        .expect(201)
        .end((err, signupRes2) => {
          if (err) return done(err);

          const token2 = signupRes2.body.token;
          const userId2 = signupRes2.body.userId;

          // User1 sends friend request to User2
          request(app)
            .post(`/friend/request/${userId2}`)
            .set("Authorization", `Bearer ${token1}`)
            .expect(201)
            .end((err) => {
              if (err) return done(err);

              // User2 accepts request from User1
              request(app)
                .post(`/friend/befriend/${userId1}`)
                .set("Authorization", `Bearer ${token2}`)
                .expect(201)
                .expect((res) => {
                  expect(res.body.id).toBeDefined();
                  expect(res.body.userId).toBe(userId1); // requester
                  expect(res.body.friendId).toBe(userId2); // receiver
                  expect(res.body.createdAt).toBeDefined();
                  expect(res.body.requestStatus).toBe("ACCEPTED");
                })
                .end(done);
            });
        });
    });
});

test("deny befriend when there is no pending friend request from the given user", (done: jest.DoneCallback) => {
  const unique1 = Date.now().toString(36);
  const unique2 = (Date.now() + 1).toString(36);

  // Create requester (User1)
  request(app)
    .post("/auth/signup")
    .send({
      email: `bef_nopend_req_${unique1}@example.com`,
      username: `bef_nopend_req_${unique1}`,
      password: "Password1",
    })
    .expect(201)
    .end((err, signupRes1) => {
      if (err) return done(err);

      const userId1 = signupRes1.body.userId;

      // Create receiver (User2)
      request(app)
        .post("/auth/signup")
        .send({
          email: `bef_nopend_rec_${unique2}@example.com`,
          username: `bef_nopend_rec_${unique2}`,
          password: "Password1",
        })
        .expect(201)
        .end((err, signupRes2) => {
          if (err) return done(err);

          const token2 = signupRes2.body.token;

          // User2 tries to accept a request from User1 that doesn't exist
          request(app)
            .post(`/friend/befriend/${userId1}`)
            .set("Authorization", `Bearer ${token2}`)
            .expect(400)
            .expect((res) => {
              expect(res.body.error).toBeDefined();
              expect(res.body.error).toBe(
                "no pending friend request from this user",
              );
            })
            .end(done);
        });
    });
});

test("deny befriend when trying to accept an already accepted request", (done: jest.DoneCallback) => {
  const unique1 = Date.now().toString(36);
  const unique2 = (Date.now() + 1).toString(36);

  // Create requester (User1)
  request(app)
    .post("/auth/signup")
    .send({
      email: `bef_dupe_req_${unique1}@example.com`,
      username: `bef_dupe_req_${unique1}`,
      password: "Password1",
    })
    .expect(201)
    .end((err, signupRes1) => {
      if (err) return done(err);

      const token1 = signupRes1.body.token;
      const userId1 = signupRes1.body.userId;

      // Create receiver (User2)
      request(app)
        .post("/auth/signup")
        .send({
          email: `bef_dupe_rec_${unique2}@example.com`,
          username: `bef_dupe_rec_${unique2}`,
          password: "Password1",
        })
        .expect(201)
        .end((err, signupRes2) => {
          if (err) return done(err);

          const token2 = signupRes2.body.token;

          // User1 sends friend request to User2
          request(app)
            .post(`/friend/request/${signupRes2.body.userId}`)
            .set("Authorization", `Bearer ${token1}`)
            .expect(201)
            .end((err) => {
              if (err) return done(err);

              // User2 accepts request from User1
              request(app)
                .post(`/friend/befriend/${userId1}`)
                .set("Authorization", `Bearer ${token2}`)
                .expect(201)
                .end((err) => {
                  if (err) return done(err);

                  // User2 tries to accept again (no longer pending)
                  request(app)
                    .post(`/friend/befriend/${userId1}`)
                    .set("Authorization", `Bearer ${token2}`)
                    .expect(400)
                    .expect((res) => {
                      expect(res.body.error).toBeDefined();
                      expect(res.body.error).toBe(
                        "no pending friend request from this user",
                      );
                    })
                    .end(done);
                });
            });
        });
    });
});

//Unfriend tests
test("successfully unfriend user", (done: jest.DoneCallback) => {
  const unique1 = Date.now().toString(36);
  const unique2 = (Date.now() + 1).toString(36);

  // Create user1
  request(app)
    .post("/auth/signup")
    .send({
      email: `unf_req_${unique1}@example.com`,
      username: `unf_req_${unique1}`,
      password: "Password1",
    })
    .expect(201)
    .end((err, res1) => {
      if (err) return done(err);

      const token1 = res1.body.token;
      const userId1 = res1.body.userId;

      // Create user2
      request(app)
        .post("/auth/signup")
        .send({
          email: `unf_rec_${unique2}@example.com`,
          username: `unf_rec_${unique2}`,
          password: "Password1",
        })
        .expect(201)
        .end((err2, res2) => {
          if (err2) return done(err2);

          const token2 = res2.body.token;
          const userId2 = res2.body.userId;

          // user1 sends friend request to user2
          request(app)
            .post(`/friend/request/${userId2}`)
            .set("Authorization", `Bearer ${token1}`)
            .expect(201)
            .end((err3) => {
              if (err3) return done(err3);

              // user2 accepts request from user1
              request(app)
                .post(`/friend/befriend/${userId1}`)
                .set("Authorization", `Bearer ${token2}`)
                .expect(201)
                .end((err4) => {
                  if (err4) return done(err4);

                  // user1 unfriends user2
                  request(app)
                    .delete(`/friend/unfriend/${userId2}`)
                    .set("Authorization", `Bearer ${token1}`)
                    .expect(200)
                    .end(done);
                });
            });
        });
    });
});

test("deny unfriend - target user does not exist", (done: jest.DoneCallback) => {
  const unique = Date.now().toString(36);
  const fakeUserId = "nonexistent-user-id";

  request(app)
    .post("/auth/signup")
    .send({
      email: `test_${unique}@example.com`,
      username: `user_${unique}`,
      password: "Password1",
    })
    .expect(201)
    .end((err, signupRes) => {
      if (err) return done(err);

      const token = signupRes.body.token;

      // Try to unfriend non-existent user
      request(app)
        .delete(`/friend/unfriend/${fakeUserId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.error).toBeDefined();
          expect(res.body.error).toBe("User not found");
        })
        .end(done);
    });
});

test("deny unfriend - not friends with user", (done: jest.DoneCallback) => {
  const unique1 = Date.now().toString(36);
  const unique2 = (Date.now() + 1).toString(36);

  // Create first user
  request(app)
    .post("/auth/signup")
    .send({
      email: `test_${unique1}@example.com`,
      username: `user_${unique1}`,
      password: "Password1",
    })
    .expect(201)
    .end((err, signupRes1) => {
      if (err) return done(err);

      const token1 = signupRes1.body.token;

      // Create second user
      request(app)
        .post("/auth/signup")
        .send({
          email: `test_${unique2}@example.com`,
          username: `user_${unique2}`,
          password: "Password1",
        })
        .expect(201)
        .end((err, signupRes2) => {
          if (err) return done(err);

          const userId2 = signupRes2.body.userId;

          // Try to unfriend without being friends
          request(app)
            .delete(`/friend/unfriend/${userId2}`)
            .set("Authorization", `Bearer ${token1}`)
            .expect(400)
            .expect((res) => {
              expect(res.body.error).toBeDefined();
              expect(res.body.error).toBe("You are not friends with this user");
            })
            .end(done);
        });
    });
});

// Get following / followers / friendships / unknown users
test("getWhoCurrentUserFollows returns users current user follows", (done: jest.DoneCallback) => {
  const unique = Date.now().toString(36);

  // Create follower (current user)
  request(app)
    .post("/auth/signup")
    .send({
      email: `fol_cur_${unique}@example.com`,
      username: `fol_cur_${unique}`,
      password: "Password1",
    })
    .expect(201)
    .end((err, resCurrent) => {
      if (err) return done(err);

      const tokenCurrent = resCurrent.body.token;
      const currentId = resCurrent.body.userId;

      // Create target user
      request(app)
        .post("/auth/signup")
        .send({
          email: `fol_tgt_${unique}@example.com`,
          username: `fol_tgt_${unique}`,
          password: "Password1",
        })
        .expect(201)
        .end((err2, resTarget) => {
          if (err2) return done(err2);

          const tokenTarget = resTarget.body.token;
          const targetId = resTarget.body.userId;

          // current user sends friend request to target
          request(app)
            .post(`/friend/request/${targetId}`)
            .set("Authorization", `Bearer ${tokenCurrent}`)
            .expect(201)
            .end((err3) => {
              if (err3) return done(err3);

              // target accepts request from current user
              request(app)
                .post(`/friend/befriend/${currentId}`)
                .set("Authorization", `Bearer ${tokenTarget}`)
                .expect(201)
                .end((err4) => {
                  if (err4) return done(err4);

                  // now check following list for current user
                  request(app)
                    .get("/friend/following")
                    .set("Authorization", `Bearer ${tokenCurrent}`)
                    .expect(200)
                    .expect((res) => {
                      expect(Array.isArray(res.body.following)).toBe(true);
                      const ids = res.body.following.map((u: any) => u.id);
                      expect(ids).toContain(targetId);
                    })
                    .end(done);
                });
            });
        });
    });
});

test("getWhoFollowsCurrentUser returns users who follow current user", (done: jest.DoneCallback) => {
  const unique = Date.now().toString(36);

  // Create current user (will be followed)
  request(app)
    .post("/auth/signup")
    .send({
      email: `fol2_cur_${unique}@example.com`,
      username: `fol2_cur_${unique}`,
      password: "Password1",
    })
    .expect(201)
    .end((err, resCurrent) => {
      if (err) return done(err);

      const tokenCurrent = resCurrent.body.token;
      const currentId = resCurrent.body.userId;

      // Create follower user
      request(app)
        .post("/auth/signup")
        .send({
          email: `fol2_fol_${unique}@example.com`,
          username: `fol2_fol_${unique}`,
          password: "Password1",
        })
        .expect(201)
        .end((err2, resFollower) => {
          if (err2) return done(err2);

          const tokenFollower = resFollower.body.token;
          const followerId = resFollower.body.userId;

          // follower sends friend request to current user
          request(app)
            .post(`/friend/request/${currentId}`)
            .set("Authorization", `Bearer ${tokenFollower}`)
            .expect(201)
            .end((err3) => {
              if (err3) return done(err3);

              // current user accepts
              request(app)
                .post(`/friend/befriend/${followerId}`)
                .set("Authorization", `Bearer ${tokenCurrent}`)
                .expect(201)
                .end((err4) => {
                  if (err4) return done(err4);

                  // now check followers list for current user
                  request(app)
                    .get("/friend/followers")
                    .set("Authorization", `Bearer ${tokenCurrent}`)
                    .expect(200)
                    .expect((res) => {
                      expect(Array.isArray(res.body.followers)).toBe(true);
                      const ids = res.body.followers.map((u: any) => u.id);
                      expect(ids).toContain(followerId);
                    })
                    .end(done);
                });
            });
        });
    });
});

test("getFriendships returns only mutual friendships", (done: jest.DoneCallback) => {
  const unique = Date.now().toString(36);

  // Create UserA
  request(app)
    .post("/auth/signup")
    .send({
      email: `mut_a_${unique}@example.com`,
      username: `mut_a_${unique}`,
      password: "Password1",
    })
    .expect(201)
    .end((err, resA) => {
      if (err) return done(err);

      const tokenA = resA.body.token;
      const userIdA = resA.body.userId;

      // Create UserB
      request(app)
        .post("/auth/signup")
        .send({
          email: `mut_b_${unique}@example.com`,
          username: `mut_b_${unique}`,
          password: "Password1",
        })
        .expect(201)
        .end((err2, resB) => {
          if (err2) return done(err2);

          const tokenB = resB.body.token;
          const userIdB = resB.body.userId;

          // Create UserC (one-way friendship)
          request(app)
            .post("/auth/signup")
            .send({
              email: `mut_c_${unique}@example.com`,
              username: `mut_c_${unique}`,
              password: "Password1",
            })
            .expect(201)
            .end((err3, resC) => {
              if (err3) return done(err3);

              const tokenC = resC.body.token;
              const userIdC = resC.body.userId;

              // A <-> B mutual friendship (two directions)
              // 1) A -> B
              request(app)
                .post(`/friend/request/${userIdB}`)
                .set("Authorization", `Bearer ${tokenA}`)
                .expect(201)
                .end((err4) => {
                  if (err4) return done(err4);

                  request(app)
                    .post(`/friend/befriend/${userIdA}`)
                    .set("Authorization", `Bearer ${tokenB}`)
                    .expect(201)
                    .end((err5) => {
                      if (err5) return done(err5);

                      // 2) B -> A
                      request(app)
                        .post(`/friend/request/${userIdA}`)
                        .set("Authorization", `Bearer ${tokenB}`)
                        .expect(201)
                        .end((err6) => {
                          if (err6) return done(err6);

                          request(app)
                            .post(`/friend/befriend/${userIdB}`)
                            .set("Authorization", `Bearer ${tokenA}`)
                            .expect(201)
                            .end((err7) => {
                              if (err7) return done(err7);

                              // C -> A (one-way only)
                              request(app)
                                .post(`/friend/request/${userIdA}`)
                                .set("Authorization", `Bearer ${tokenC}`)
                                .expect(201)
                                .end((err8) => {
                                  if (err8) return done(err8);

                                  request(app)
                                    .post(`/friend/befriend/${userIdC}`)
                                    .set("Authorization", `Bearer ${tokenA}`)
                                    .expect(201)
                                    .end((err9) => {
                                      if (err9) return done(err9);

                                      // Now query friendships for A; should include B but not C (only mutual)
                                      request(app)
                                        .get("/friend/friendships")
                                        .set(
                                          "Authorization",
                                          `Bearer ${tokenA}`,
                                        )
                                        .expect(200)
                                        .expect((res) => {
                                          expect(
                                            Array.isArray(res.body.friendships),
                                          ).toBe(true);
                                          const ids = res.body.friendships.map(
                                            (u: any) => u.id,
                                          );
                                          expect(ids).toContain(userIdB);
                                          expect(ids).not.toContain(userIdC);
                                        })
                                        .end(done);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

test("getUnknownUsers returns users with no relation to current user", (done: jest.DoneCallback) => {
  const unique = Date.now().toString(36);

  // Current user
  request(app)
    .post("/auth/signup")
    .send({
      email: `unk_cur_${unique}@example.com`,
      username: `unk_cur_${unique}`,
      password: "Password1",
    })
    .expect(201)
    .end((err, resCur) => {
      if (err) return done(err);

      const tokenCurrent = resCur.body.token;
      const currentId = resCur.body.userId;

      // Friend user (will be connected)
      request(app)
        .post("/auth/signup")
        .send({
          email: `unk_friend_${unique}@example.com`,
          username: `unk_friend_${unique}`,
          password: "Password1",
        })
        .expect(201)
        .end((err2, resFriend) => {
          if (err2) return done(err2);

          const tokenFriend = resFriend.body.token;
          const friendId = resFriend.body.userId;

          // Unknown user (no relation)
          request(app)
            .post("/auth/signup")
            .send({
              email: `unk_unknown_${unique}@example.com`,
              username: `unk_unknown_${unique}`,
              password: "Password1",
            })
            .expect(201)
            .end((err3, resUnknown) => {
              if (err3) return done(err3);

              const unknownId = resUnknown.body.userId;

              // current user <-> friend (mutual or at least one-way)
              request(app)
                .post(`/friend/request/${friendId}`)
                .set("Authorization", `Bearer ${tokenCurrent}`)
                .expect(201)
                .end((err4) => {
                  if (err4) return done(err4);

                  request(app)
                    .post(`/friend/befriend/${currentId}`)
                    .set("Authorization", `Bearer ${tokenFriend}`)
                    .expect(201)
                    .end((err5) => {
                      if (err5) return done(err5);

                      // Now query unknown users
                      request(app)
                        .get("/friend/unknown")
                        .set("Authorization", `Bearer ${tokenCurrent}`)
                        .expect(200)
                        .expect((res) => {
                          expect(Array.isArray(res.body.unknownUsers)).toBe(
                            true,
                          );
                          const ids = res.body.unknownUsers.map(
                            (u: any) => u.id,
                          );
                          expect(ids).toContain(unknownId);
                          expect(ids).not.toContain(friendId);
                          expect(ids).not.toContain(currentId);
                        })
                        .end(done);
                    });
                });
            });
        });
    });
});

afterAll(async () => {
  await prisma.$disconnect();
});
