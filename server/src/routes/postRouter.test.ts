import express from 'express';
import request from 'supertest';
import authRouter from './authRouter';
import postRouter from './postRouter';
import { prisma } from '../lib/prisma';

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

afterAll(async () => {
  await prisma.$disconnect();
});