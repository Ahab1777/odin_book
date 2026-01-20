import express from "express";
import request from "supertest";
import authRouter from "../authRouter";
import { prisma } from "../../lib/prisma";
import friendRouter from "../friendRouter";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", authRouter);
app.use("/friend", friendRouter);

//Befriend tests
test("successfully add user as friend", (done: jest.DoneCallback) => {
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
      const userId1 = signupRes1.body.userId;

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

          // First user befriends second user
          request(app)
            .post(`/friend/befriend/${userId2}`)
            .set("Authorization", `Bearer ${token1}`)
            .expect(201)
            .expect((res) => {
              expect(res.body.id).toBeDefined();
              expect(res.body.userId).toBe(userId1);
              expect(res.body.friendId).toBe(userId2);
              expect(res.body.createdAt).toBeDefined();
            })
            .end(done);
        });
    });
});

test("deny befriend - target user does not exist", (done: jest.DoneCallback) => {
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

      // Try to befriend non-existent user
      request(app)
        .post(`/friend/befriend/${fakeUserId}`)
        .set("Authorization", `Bearer ${token}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.error).toBeDefined();
          expect(res.body.error).toBe("User not found");
        })
        .end(done);
    });
});

test("deny befriend - already friends with user", (done: jest.DoneCallback) => {
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
      const userId1 = signupRes1.body.userId;

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

          // First user befriends second user
          request(app)
            .post(`/friend/befriend/${userId2}`)
            .set("Authorization", `Bearer ${token1}`)
            .expect(201)
            .end((err) => {
              if (err) return done(err);

              // Try to befriend again (should fail)
              request(app)
                .post(`/friend/befriend/${userId2}`)
                .set("Authorization", `Bearer ${token1}`)
                .expect(400)
                .expect((res) => {
                  expect(res.body.error).toBeDefined();
                  expect(res.body.error).toBe("Already friends with this user");
                })
                .end(done);
            });
        });
    });
});

//Unfriend tests
test("successfully unfriend user", (done: jest.DoneCallback) => {
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
      const userId1 = signupRes1.body.userId;

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

          // First user befriends second user
          request(app)
            .post(`/friend/befriend/${userId2}`)
            .set("Authorization", `Bearer ${token1}`)
            .expect(201)
            .end((err) => {
              if (err) return done(err);

              // First user unfriends second user
              request(app)
                .delete(`/friend/unfriend/${userId2}`)
                .set("Authorization", `Bearer ${token1}`)
                .expect(200)
                .expect((res) => {
                  expect(res.body.message).toBeDefined();
                  expect(res.body.message).toBe("Successfully unfriended user");
                })
                .end(done);
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
      const userId1 = signupRes1.body.userId;

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

          // First user befriends second user
          request(app)
            .post(`/friend/befriend/${userId2}`)
            .set("Authorization", `Bearer ${token1}`)
            .expect(201)
            .end((err) => {
              if (err) return done(err);

              // Fetch following list
              request(app)
                .get("/friend/following")
                .set("Authorization", `Bearer ${token1}`)
                .expect(200)
                .expect((res) => {
                  expect(Array.isArray(res.body.following)).toBe(true);
                  expect(res.body.following.length).toBe(1);
                  expect(res.body.following[0].id).toBe(userId2);
                })
                .end(done);
            });
        });
    });
});

test("getWhoFollowsCurrentUser returns users who follow current user", (done: jest.DoneCallback) => {
  const unique1 = Date.now().toString(36);
  const unique2 = (Date.now() + 1).toString(36);

  // Create first user (will follow second)
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

      // Create second user (will be followed)
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

          const token2 = signupRes2.body.token;
          const userId1 = signupRes1.body.userId;
          const userId2 = signupRes2.body.userId;

          // User1 follows user2
          request(app)
            .post(`/friend/befriend/${userId2}`)
            .set("Authorization", `Bearer ${token1}`)
            .expect(201)
            .end((err) => {
              if (err) return done(err);

              // For user2, user1 should be in followers
              request(app)
                .get("/friend/followers")
                .set("Authorization", `Bearer ${token2}`)
                .expect(200)
                .expect((res) => {
                  expect(Array.isArray(res.body.followers)).toBe(true);
                  expect(res.body.followers.length).toBe(1);
                  expect(res.body.followers[0].id).toBe(userId1);
                })
                .end(done);
            });
        });
    });
});

test("getFriendships returns only mutual friendships", (done: jest.DoneCallback) => {
  const unique1 = Date.now().toString(36);
  const unique2 = (Date.now() + 1).toString(36);
  const unique3 = (Date.now() + 2).toString(36);

  // Create user A
  request(app)
    .post("/auth/signup")
    .send({
      email: `test_${unique1}@example.com`,
      username: `user_${unique1}`,
      password: "Password1",
    })
    .expect(201)
    .end((err, signupResA) => {
      if (err) return done(err);

      const tokenA = signupResA.body.token;
      const userIdA = signupResA.body.userId;

      // Create user B
      request(app)
        .post("/auth/signup")
        .send({
          email: `test_${unique2}@example.com`,
          username: `user_${unique2}`,
          password: "Password1",
        })
        .expect(201)
        .end((err, signupResB) => {
          if (err) return done(err);

          const tokenB = signupResB.body.token;
          const userIdB = signupResB.body.userId;

          // Create user C
          request(app)
            .post("/auth/signup")
            .send({
              email: `test_${unique3}@example.com`,
              username: `user_${unique3}`,
              password: "Password1",
            })
            .expect(201)
            .end((err, signupResC) => {
              if (err) return done(err);

              const userIdC = signupResC.body.userId;

              // A follows B (mutual after B follows A)
              request(app)
                .post(`/friend/befriend/${userIdB}`)
                .set("Authorization", `Bearer ${tokenA}`)
                .expect(201)
                .end((err) => {
                  if (err) return done(err);

                  // B follows A (completes mutual)
                  request(app)
                    .post(`/friend/befriend/${userIdA}`)
                    .set("Authorization", `Bearer ${tokenB}`)
                    .expect(201)
                    .end((err) => {
                      if (err) return done(err);

                      // A follows C (non-mutual)
                      request(app)
                        .post(`/friend/befriend/${userIdC}`)
                        .set("Authorization", `Bearer ${tokenA}`)
                        .expect(201)
                        .end((err) => {
                          if (err) return done(err);

                          // Fetch friendships for A → should only include B
                          request(app)
                            .get("/friend/friendships")
                            .set("Authorization", `Bearer ${tokenA}`)
                            .expect(200)
                            .expect((res) => {
                              expect(Array.isArray(res.body.friendships)).toBe(
                                true,
                              );
                              expect(res.body.friendships.length).toBe(1);
                              expect(res.body.friendships[0].id).toBe(userIdB);
                            })
                            .end(done);
                        });
                    });
                });
            });
        });
    });
});

test("getUnknownUsers returns users with no relation to current user", (done: jest.DoneCallback) => {
  const unique1 = Date.now().toString(36);
  const unique2 = (Date.now() + 1).toString(36);
  const unique3 = (Date.now() + 2).toString(36);

  // Create current user
  request(app)
    .post("/auth/signup")
    .send({
      email: `test_${unique1}@example.com`,
      username: `user_${unique1}`,
      password: "Password1",
    })
    .expect(201)
    .end((err, signupResCurrent) => {
      if (err) return done(err);

      const tokenCurrent = signupResCurrent.body.token;
      const userIdCurrent = signupResCurrent.body.userId;

      // Create user F (will become friend)
      request(app)
        .post("/auth/signup")
        .send({
          email: `test_${unique2}@example.com`,
          username: `user_${unique2}`,
          password: "Password1",
        })
        .expect(201)
        .end((err, signupResF) => {
          if (err) return done(err);

          const userIdF = signupResF.body.userId;

          // Create user U (should remain unknown)
          request(app)
            .post("/auth/signup")
            .send({
              email: `test_${unique3}@example.com`,
              username: `user_${unique3}`,
              password: "Password1",
            })
            .expect(201)
            .end((err, signupResU) => {
              if (err) return done(err);

              const userIdU = signupResU.body.userId;

              // Current user follows F (creating a relation)
              request(app)
                .post(`/friend/befriend/${userIdF}`)
                .set("Authorization", `Bearer ${tokenCurrent}`)
                .expect(201)
                .end((err) => {
                  if (err) return done(err);

                  // Fetch unknown users for current user → should only include U
                  request(app)
                    .get("/friend/unknown")
                    .set("Authorization", `Bearer ${tokenCurrent}`)
                    .expect(200)
                    .expect((res) => {
                      expect(Array.isArray(res.body.unknownUsers)).toBe(true);
                      const ids = res.body.unknownUsers.map((u: any) => u.id);
                      expect(ids).toContain(userIdU);
                      expect(ids).not.toContain(userIdF);
                      expect(ids).not.toContain(userIdCurrent);
                    })
                    .end(done);
                });
            });
        });
    });
});

afterAll(async () => {
  await prisma.$disconnect();
});
