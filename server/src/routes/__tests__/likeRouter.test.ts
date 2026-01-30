import express from "express";
import request from "supertest";
import { routes } from "../index";
import { prisma } from "../../lib/prisma";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", routes.auth);
app.use("/post", routes.post);
app.use("/like", routes.like);

let token: string;
let userId: string;
let postId: string;

beforeAll((done: jest.DoneCallback) => {
  const unique = Date.now().toString(36);

  // Sign up a user and get JWT
  request(app)
    .post("/auth/signup")
    .send({
      email: `like.test.${unique}@gmail.com`,
      username: `like_user_${unique}`,
      password: "Password1",
    })
    .expect(201)
    .end((err, signupRes) => {
      if (err) return done(err);

      token = signupRes.body.token;
      userId = signupRes.body.userId;

      // Create a post for this user
      request(app)
        .post("/post/create")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Like test post",
          content: "Post content for like tests",
          userId,
        })
        .expect(201)
        .end((postErr, postRes) => {
          if (postErr) return done(postErr);

          postId = postRes.body.id;
          done();
        });
    });
});

// 1) addLike works for first like
it("adds a like for the current user on the target post", (done: jest.DoneCallback) => {
  request(app)
    .post(`/like/${postId}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(201)
    .end(async (err, res) => {
      if (err) return done(err);

      expect(res.body.id).toBeDefined();
      expect(res.body.userId).toBe(userId);
      expect(res.body.postId).toBe(postId);
      expect(res.body.createdAt).toBeDefined();

      try {
        const likeCount = await prisma.like.count({
          where: { userId, postId },
        });
        expect(likeCount).toBe(1);
        done();
      } catch (dbErr) {
        done(dbErr as Error);
      }
    });
});

// 2) addLike does not add extra like if user already liked the post
it("does not create a second like for the same user and post", (done: jest.DoneCallback) => {
  // First like already created in previous test
  request(app)
    .post(`/like/${postId}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(409)
    .end(async (err, res) => {
      if (err) return done(err);

      expect(res.body.error).toBe("You have already liked this post");

      try {
        const likeCount = await prisma.like.count({
          where: { userId, postId },
        });
        expect(likeCount).toBe(1);
        done();
      } catch (dbErr) {
        done(dbErr as Error);
      }
    });
});

// 3) deleteLike removes the like for current user and post
it("removes an existing like for the current user on the target post", (done: jest.DoneCallback) => {
  // A like already exists from the first test
  request(app)
    .delete(`/like/${postId}`)
    .set("Authorization", `Bearer ${token}`)
    .expect(200)
    .end(async (err, res) => {
      if (err) return done(err);

      expect(res.body.message).toBe("Like removed successfully");
      expect(res.body.postId).toBe(postId);
      expect(res.body.userId).toBe(userId);

      try {
        const likeCount = await prisma.like.count({
          where: { userId, postId },
        });
        expect(likeCount).toBe(0);
        done();
      } catch (dbErr) {
        done(dbErr as Error);
      }
    });
});

afterAll(async () => {
  // Optional cleanup to keep test DB tidy
  await prisma.like.deleteMany({ where: { postId } });
  await prisma.post.deleteMany({ where: { id: postId } });
  await prisma.user.deleteMany({ where: { id: userId } });
  await prisma.$disconnect();
});
