import express from 'express';
import request from 'supertest';
import authRouter from '../authRouter';
import postRouter from '../postRouter';
import { prisma } from '../../lib/prisma';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/auth', authRouter);
app.use('/post', postRouter);

let title: string;
let content: string;
let shortTitle: string;
let shortContent: string;
let bigTitle: string;
let bigContent: string

beforeAll(() => {
    const suffix = Math.random().toString(36).substring(2, 6);
    title = suffix.repeat(2);
    content = suffix.repeat(4);
    shortTitle = 'a';
    shortContent = 'b';
    bigTitle = suffix.repeat(1000);
    bigContent = suffix.repeat(1000);
    

});


//Post creation
test('creates post via JWT from /auth', (done: jest.DoneCallback) => {
  const unique = Date.now().toString(36);

  // 1) Sign up a user and get a real JWT
  request(app)
    .post('/auth/signup')
    .send({
      email: `test_${unique}@example.com`,
      username: `user_${unique}`,
      password: 'Password1'
    })
    .expect(201)
    .end((err, signupRes) => {
      if (err) return done(err);

      const token = signupRes.body.token;
      const userId = signupRes.body.userId; // if you still need it in body for validation

      // 2) Call protected create-post route with Authorization header
      request(app)
        .post('/post/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title,
          content,
          // include userId only if your validation still requires it
          userId,
        })
        .expect(201)
        .expect((postRes) => {
          expect(postRes.body.title).toBe(title);
          expect(postRes.body.content).toBe(content);
          expect(postRes.body.userId).toBe(userId);
          expect(postRes.body.id).toBeDefined();
          expect(postRes.body.createdAt).toBeDefined();
        })
        .end(done);
    });
});

test('deny post creation - incorrect formatting', (done: jest.DoneCallback) => {
  const unique = Date.now().toString(36);

  // 1) Sign up a user and get a real JWT
  request(app)
    .post('/auth/signup')
    .send({
      email: `test_${unique}@example.com`,
      username: `user_${unique}`,
      password: 'Password1'
    })
    .expect(201)
    .end((err, signupRes) => {
      if (err) return done(err);

      const token = signupRes.body.token;
    const userId = signupRes.body.userId;

    // 2) Call protected create-post route with invalid data
    request(app)
      .post('/post/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: shortTitle,
        content: shortContent,
        userId,
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toBeDefined();
        expect(Array.isArray(res.body.errors)).toBe(true);
        expect(res.body.errors.length).toBeGreaterThan(0);
        // Both title and content should have errors
        const titleError = res.body.errors.find((e: any) => e.path === 'title');
        const contentError = res.body.errors.find((e: any) => e.path === 'content');
        expect(titleError).toBeDefined();
        expect(contentError).toBeDefined();
      })
      .end(done);
    });
});

test('deny post creation - title too long', (done: jest.DoneCallback) => {
  const unique = Date.now().toString(36);

  request(app)
    .post('/auth/signup')
    .send({
    email: `test_${unique}@example.com`,
    username: `user_${unique}`,
    password: 'Password1'
    })
    .expect(201)
    .end((err, signupRes) => {
    if (err) return done(err);

    const token = signupRes.body.token;
    const userId = signupRes.body.userId;

    request(app)
      .post('/post/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: bigTitle,
        content,
        userId,
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toBeDefined();
        const titleError = res.body.errors.find((e: any) => e.path === 'title');
        expect(titleError).toBeDefined();
        expect(titleError.msg).toBe('Title must be between 3 and 24 characters');
      })
      .end(done);
    });
});

test('deny post creation - content too long', (done: jest.DoneCallback) => {
  const unique = Date.now().toString(36);

  request(app)
    .post('/auth/signup')
    .send({
    email: `test_${unique}@example.com`,
    username: `user_${unique}`,
    password: 'Password1'
    })
    .expect(201)
    .end((err, signupRes) => {
    if (err) return done(err);

    const token = signupRes.body.token;
    const userId = signupRes.body.userId;

    request(app)
      .post('/post/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title,
        content: bigContent,
        userId,
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toBeDefined();
        const contentError = res.body.errors.find((e: any) => e.path === 'content');
        expect(contentError).toBeDefined();
        expect(contentError.msg).toBe('Content must be between 10 and 240 characters');
      })
      .end(done);
    });
});

test('deny post creation - missing authorization token', (done: jest.DoneCallback) => {
  request(app)
    .post('/post/create')
    .send({
    title,
    content,
    })
    .expect(401)
    .expect((res) => {
      expect(res.body.error).toBeDefined();
      expect(res.body.error).toBe('Access token required');
    })
    .end(done);
});

test('deny post creation - invalid authorization token', (done: jest.DoneCallback) => {
  request(app)
    .post('/post/create')
    .set('Authorization', 'Bearer invalid_token')
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

test('deny post creation - missing title', (done: jest.DoneCallback) => {
  const unique = Date.now().toString(36);

  request(app)
    .post('/auth/signup')
    .send({
    email: `test_${unique}@example.com`,
    username: `user_${unique}`,
    password: 'Password1'
    })
    .expect(201)
    .end((err, signupRes) => {
    if (err) return done(err);

    const token = signupRes.body.token;
    const userId = signupRes.body.userId;

    request(app)
      .post('/post/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        content,
        userId,
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toBeDefined();
        const titleError = res.body.errors.find((e: any) => e.path === 'title');
        expect(titleError).toBeDefined();
        expect(titleError.msg).toBe('Title must be between 3 and 24 characters');
      })
      .end(done);
    });
});

test('deny post creation - missing content', (done: jest.DoneCallback) => {
  const unique = Date.now().toString(36);

  request(app)
    .post('/auth/signup')
    .send({
    email: `test_${unique}@example.com`,
    username: `user_${unique}`,
    password: 'Password1'
    })
    .expect(201)
    .end((err, signupRes) => {
    if (err) return done(err);

    const token = signupRes.body.token;
    const userId = signupRes.body.userId;

    request(app)
      .post('/post/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title,
        userId,
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.errors).toBeDefined();
        const contentError = res.body.errors.find((e: any) => e.path === 'content');
        expect(contentError).toBeDefined();
        expect(contentError.msg).toBe('Content must be between 10 and 240 characters');
      })
      .end(done);
    });
});

//Post deletion
test('post is deleted', (done: jest.DoneCallback) => {
  const unique = Date.now().toString(36);

  request(app)
    .post('/auth/signup')
    .send({
      email: `test_${unique}@example.com`,
      username: `user_${unique}`,
      password: 'Password1'
    })
    .expect(201)
    .end((err, signupRes) => {
      if (err) return done(err);

      const token = signupRes.body.token;
      const userId = signupRes.body.userId;

      // Create a post first
      request(app)
        .post('/post/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title,
          content,
          userId,
        })
        .expect(201)
        .end((err, postRes) => {
          if (err) return done(err);

          const postId = postRes.body.id;

          // Delete the post
          request(app)
            .delete(`/post/${postId}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect((res) => {
              expect(res.body.message).toBeDefined();
            })
            .end(done);
        });
    });
});

test('only post owner can delete it', (done: jest.DoneCallback) => {
  const unique1 = Date.now().toString(36);
  const unique2 = (Date.now() + 1).toString(36);

  // Create first user and post
  request(app)
    .post('/auth/signup')
    .send({
      email: `test_${unique1}@example.com`,
      username: `user_${unique1}`,
      password: 'Password1'
    })
    .expect(201)
    .end((err, signupRes1) => {
      if (err) return done(err);

      const token1 = signupRes1.body.token;
      const userId1 = signupRes1.body.userId;

      // Create post with first user
      request(app)
        .post('/post/create')
        .set('Authorization', `Bearer ${token1}`)
        .send({
          title,
          content,
          userId: userId1,
        })
        .expect(201)
        .end((err, postRes) => {
          if (err) return done(err);

          const postId = postRes.body.id;

          // Create second user
          request(app)
            .post('/auth/signup')
            .send({
              email: `test_${unique2}@example.com`,
              username: `user_${unique2}`,
              password: 'Password1'
            })
            .expect(201)
            .end((err, signupRes2) => {
              if (err) return done(err);

              const token2 = signupRes2.body.token;

              // Try to delete post with second user (should fail)
              request(app)
                .delete(`/post/${postId}`)
                .set('Authorization', `Bearer ${token2}`)
                .expect(403)
                .expect((res) => {
                  expect(res.body.error).toBeDefined();
                })
                .end(done);
            });
        });
    });
});

//Get post
test('function return correct post', (done: jest.DoneCallback) => {
  const unique = Date.now().toString(36);

  request(app)
    .post('/auth/signup')
    .send({
      email: `test_${unique}@example.com`,
      username: `user_${unique}`,
      password: 'Password1'
    })
    .expect(201)
    .end((err, signupRes) => {
      if (err) return done(err);

      const token = signupRes.body.token;
      const userId = signupRes.body.userId;

      // Create a post first
      request(app)
        .post('/post/create')
        .set('Authorization', `Bearer ${token}`)
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
              expect(res.body.createdAt).toBeDefined();
            })
            .end(done);
        });
    });
});

test('function return 404 if the post does not exist', (done: jest.DoneCallback) => {
  const fakePostId = 'nonexistent-post-id';

  request(app)
    .get(`/post/${fakePostId}`)
    .expect(404)
    .expect((res) => {
      expect(res.body.error).toBeDefined();
      expect(res.body.error).toBe('Post not found');
    })
    .end(done);
});

afterAll(async () => {
  await prisma.$disconnect();
});
