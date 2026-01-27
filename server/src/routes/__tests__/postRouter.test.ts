import express from "express";
import request from "supertest";
import authRouter from "../authRouter";
import postRouter from "../postRouter";
import { prisma } from "../../lib/prisma";
import friendTestUtils from "../testUtils/friendUtils";
import postTestUtils from "../testUtils/postUtils";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", authRouter);
app.use("/post", postRouter);

let title: string;
let content: string;
let shortTitle: string;
let shortContent: string;
let bigTitle: string;
let bigContent: string;

// Data for getPostIndex tests
let indexToken: string;
let indexUserId: string;
let friendUserId: string;
let strangerUserId: string;
let friendToken: string;
let strangerToken: string;
let ownPostId: string;
let friendPostId: string;
let strangerPostId: string;

beforeAll(() => {
  const suffix = Math.random().toString(36).substring(2, 6);
  title = suffix.repeat(2);
  content = suffix.repeat(4);
  shortTitle = "a";
  shortContent = "b";
  bigTitle = suffix.repeat(1000);
  bigContent = suffix.repeat(1000);
});

// Setup users, friendships, and posts for getPostIndex tests
beforeAll(async () => {
  const base = Date.now().toString(36);

  // Create main user (whose index we will query)
  const mainUser = await friendTestUtils.signupUser(`index_main_${base}`);
  indexToken = mainUser.token;
  indexUserId = mainUser.id;

  // Create friend user
  const friendUser = await friendTestUtils.signupUser(`index_friend_${base}`);
  friendToken = friendUser.token;
  friendUserId = friendUser.id;

  // Create stranger user (not a friend)
  const strangerUser = await friendTestUtils.signupUser(
    `index_stranger_${base}`,
  );
  strangerToken = strangerUser.token;
  strangerUserId = strangerUser.id;

  // Establish friendship between main user and friend user via friend routes
  await friendTestUtils.createFriendship(mainUser, friendUser);

  // Create a post for the main user
  const ownPostRes = await postTestUtils.createPost(mainUser, {
    title: "Index main",
    content: `Index main content ${base} more text`,
    userId: indexUserId,
  });

  ownPostId = ownPostRes.body.id;

  // Create a post for the friend user
  const friendPostRes = await postTestUtils.createPost(friendUser, {
    title: "Index friend",
    content: `Index friend content ${base} more text`,
    userId: friendUserId,
  });

  friendPostId = friendPostRes.body.id;

  // Create a post for the stranger user (should NOT appear in index)
  const strangerPostRes = await postTestUtils.createPost(strangerUser, {
    title: "Index stranger",
    content: `Index stranger content ${base} more text`,
    userId: strangerUserId,
  });

  strangerPostId = strangerPostRes.body.id;
});

//Post creation
test("creates post via JWT from /auth", async () => {
  const user = await friendTestUtils.signupUser("post_create");

  const res = await postTestUtils.createPost(user, {
    title,
    content,
    userId: user.id,
  });

  expect(res.status).toBe(201);
  expect(res.body.title).toBe(title);
  expect(res.body.content).toBe(content);
  expect(res.body.userId).toBe(user.id);
  expect(res.body.id).toBeDefined();
  expect(res.body.createdAt).toBeDefined();
});

test("deny post creation - incorrect formatting", async () => {
  const user = await friendTestUtils.signupUser("post_bad_fmt");

  const res = await postTestUtils.createPost(user, {
    title: shortTitle,
    content: shortContent,
    userId: user.id,
  });

  expect(res.status).toBe(400);
  expect(res.body.errors).toBeDefined();
  expect(Array.isArray(res.body.errors)).toBe(true);
  expect(res.body.errors.length).toBeGreaterThan(0);
  const titleError = res.body.errors.find((e: any) => e.path === "title");
  const contentError = res.body.errors.find((e: any) => e.path === "content");
  expect(titleError).toBeDefined();
  expect(contentError).toBeDefined();
});

test("deny post creation - title too long", async () => {
  const user = await friendTestUtils.signupUser("post_title_long");

  const res = await postTestUtils.createPost(user, {
    title: bigTitle,
    content,
    userId: user.id,
  });

  expect(res.status).toBe(400);
  expect(res.body.errors).toBeDefined();
  const titleError = res.body.errors.find((e: any) => e.path === "title");
  expect(titleError).toBeDefined();
  expect(titleError.msg).toBe("Title must be between 3 and 24 characters");
});

test("deny post creation - content too long", async () => {
  const user = await friendTestUtils.signupUser("post_content_long");

  const res = await postTestUtils.createPost(user, {
    title,
    content: bigContent,
    userId: user.id,
  });

  expect(res.status).toBe(400);
  expect(res.body.errors).toBeDefined();
  const contentError = res.body.errors.find((e: any) => e.path === "content");
  expect(contentError).toBeDefined();
  expect(contentError.msg).toBe(
    "Content must be between 10 and 240 characters",
  );
});

test("deny post creation - missing authorization token", (done: jest.DoneCallback) => {
  request(app)
    .post("/post/create")
    .send({
      title,
      content,
    })
    .expect(401)
    .expect((res) => {
      expect(res.body.error).toBeDefined();
      expect(res.body.error).toBe("Access token required");
    })
    .end(done);
});

test("deny post creation - invalid authorization token", (done: jest.DoneCallback) => {
  request(app)
    .post("/post/create")
    .set("Authorization", "Bearer invalid_token")
    .send({
      title,
      content,
    })
    .expect(403)
    .expect((res) => {
      expect(res.body.error).toBeDefined();
    })
    .end(done);
});

test("deny post creation - missing title", async () => {
  const user = await friendTestUtils.signupUser("post_missing_title");

  const res = await postTestUtils.createPost(user, {
    content,
    userId: user.id,
  } as any);

  expect(res.status).toBe(400);
  expect(res.body.errors).toBeDefined();
  const titleError = res.body.errors.find((e: any) => e.path === "title");
  expect(titleError).toBeDefined();
  expect(titleError.msg).toBe("Title must be between 3 and 24 characters");
});

test("deny post creation - missing content", async () => {
  const user = await friendTestUtils.signupUser("post_missing_content");

  const res = await postTestUtils.createPost(user, {
    title,
    userId: user.id,
  } as any);

  expect(res.status).toBe(400);
  expect(res.body.errors).toBeDefined();
  const contentError = res.body.errors.find((e: any) => e.path === "content");
  expect(contentError).toBeDefined();
  expect(contentError.msg).toBe(
    "Content must be between 10 and 240 characters",
  );
});

//Post deletion
test("post is deleted", async () => {
  const user = await friendTestUtils.signupUser("post_delete");

  const createRes = await postTestUtils.createPost(user, {
    title,
    content,
    userId: user.id,
  });

  expect(createRes.status).toBe(201);
  const postId = createRes.body.id;

  const deleteRes = await postTestUtils.deletePost(user, postId);
  expect(deleteRes.status).toBe(200);
  expect(deleteRes.body.message).toBeDefined();
});

test("only post owner can delete it", async () => {
  const owner = await friendTestUtils.signupUser("post_owner");
  const other = await friendTestUtils.signupUser("post_other");

  const createRes = await postTestUtils.createPost(owner, {
    title,
    content,
    userId: owner.id,
  });

  expect(createRes.status).toBe(201);
  const postId = createRes.body.id;

  const res = await postTestUtils.deletePost(other, postId);

  expect(res.status).toBe(403);
  expect(res.body.error).toBeDefined();
});

//Post update
test("updates post title and content", async () => {
  const unique = Date.now().toString(36);

  const originalTitle = `Orig_${unique}`.slice(0, 20);
  const originalContent = `Original content ${unique} more text`;
  const newTitle = `New_${unique}`.slice(0, 20);
  const newContent = `Updated content ${unique} even more text`;

  const user = await friendTestUtils.signupUser("post_update");

  const createRes = await postTestUtils.createPost(user, {
    title: originalTitle,
    content: originalContent,
    userId: user.id,
  });

  expect(createRes.status).toBe(201);
  const postId = createRes.body.id;

  const updateRes = await postTestUtils.updatePost(user, postId, {
    title: newTitle,
    content: newContent,
    userId: user.id,
  });

  expect(updateRes.status).toBe(200);
  expect(updateRes.body.id).toBe(postId);
  expect(updateRes.body.title).toBe(newTitle);
  expect(updateRes.body.content).toBe(newContent);
  expect(updateRes.body.userId).toBe(user.id);

  const updated = await prisma.post.findUnique({ where: { id: postId } });
  expect(updated).not.toBeNull();
  expect(updated!.title).toBe(newTitle);
  expect(updated!.content).toBe(newContent);
});

//Get post
test("function return correct post", (done: jest.DoneCallback) => {
  const unique = Date.now().toString(36);

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
      const userId = signupRes.body.userId;

      // Create a post first
      request(app)
        .post("/post/create")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title,
          content,
          userId,
        })
        .expect(201)
        .end((err, postRes) => {
          if (err) return done(err);

          const postId = postRes.body.id;

          // Get the post
          request(app)
            .get(`/post/${postId}`)
            .expect(200)
            .expect((res) => {
              expect(res.body.id).toBe(postId);
              expect(res.body.title).toBe(title);
              expect(res.body.content).toBe(content);
              expect(res.body.userId).toBe(userId);
              expect(res.body.user).toBeDefined();
              expect(res.body.user.id).toBe(userId);
              expect(res.body.user.username).toBeDefined();
              expect(res.body.comments).toBeDefined();
              expect(Array.isArray(res.body.comments)).toBe(true);
              expect(res.body.likes).toBeDefined();
              expect(Array.isArray(res.body.likes)).toBe(true);
              expect(res.body.likes.length).toBe(0);
              expect(res.body.createdAt).toBeDefined();
            })
            .end(done);
        });
    });
});

test("function return 404 if the post does not exist", (done: jest.DoneCallback) => {
  const fakePostId = "nonexistent-post-id";

  request(app)
    .get(`/post/${fakePostId}`)
    .expect(404)
    .expect((res) => {
      expect(res.body.error).toBeDefined();
      expect(res.body.error).toBe("Post not found");
    })
    .end(done);
});



//Get post index

test("getPostIndex returns posts from current user and their friends only", async () => {
  const res = await request(app)
    .get("/post/index")
    .set("Authorization", `Bearer ${indexToken}`)
    .expect(200);

  expect(res.body.posts).toBeDefined();
  expect(Array.isArray(res.body.posts)).toBe(true);

  const returnedIds = res.body.posts.map((p: any) => p.id);

  // Should include main user's post and friend's post
  expect(returnedIds).toContain(ownPostId);
  expect(returnedIds).toContain(friendPostId);

  // Should NOT include stranger's post
  expect(returnedIds).not.toContain(strangerPostId);
});

afterAll(async () => {
  await prisma.$disconnect();
});
