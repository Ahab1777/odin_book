import express from 'express';
import request from 'supertest';
import authRouter from '../authRouter';
import userRouter from '../userRouter';
import { prisma } from '../../lib/prisma';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/auth', authRouter);
app.use('/user', userRouter);

//Befriend tests
test('successfully add user as friend', (done: jest.DoneCallback) => {
  const unique1 = Date.now().toString(36);
  const unique2 = (Date.now() + 1).toString(36);

  // Create first user
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

          const userId2 = signupRes2.body.userId;

          // First user befriends second user
          request(app)
            .post(`/user/befriend/${userId2}`)
            .set('Authorization', `Bearer ${token1}`)
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

test('deny befriend - target user does not exist', (done: jest.DoneCallback) => {
  const unique = Date.now().toString(36);
  const fakeUserId = 'nonexistent-user-id';

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

      // Try to befriend non-existent user
      request(app)
        .post(`/user/befriend/${fakeUserId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.error).toBeDefined();
          expect(res.body.error).toBe('User not found');
        })
        .end(done);
    });
});

test('deny befriend - already friends with user', (done: jest.DoneCallback) => {
  const unique1 = Date.now().toString(36);
  const unique2 = (Date.now() + 1).toString(36);

  // Create first user
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

          const userId2 = signupRes2.body.userId;

          // First user befriends second user
          request(app)
            .post(`/user/befriend/${userId2}`)
            .set('Authorization', `Bearer ${token1}`)
            .expect(201)
            .end((err) => {
              if (err) return done(err);

              // Try to befriend again (should fail)
              request(app)
                .post(`/user/befriend/${userId2}`)
                .set('Authorization', `Bearer ${token1}`)
                .expect(400)
                .expect((res) => {
                  expect(res.body.error).toBeDefined();
                  expect(res.body.error).toBe('Already friends with this user');
                })
                .end(done);
            });
        });
    });
});

//Unfriend tests
test('successfully unfriend user', (done: jest.DoneCallback) => {
  const unique1 = Date.now().toString(36);
  const unique2 = (Date.now() + 1).toString(36);

  // Create first user
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

          const userId2 = signupRes2.body.userId;

          // First user befriends second user
          request(app)
            .post(`/user/befriend/${userId2}`)
            .set('Authorization', `Bearer ${token1}`)
            .expect(201)
            .end((err) => {
              if (err) return done(err);

              // First user unfriends second user
              request(app)
                .delete(`/user/unfriend/${userId2}`)
                .set('Authorization', `Bearer ${token1}`)
                .expect(200)
                .expect((res) => {
                  expect(res.body.message).toBeDefined();
                  expect(res.body.message).toBe('Successfully unfriended user');
                })
                .end(done);
            });
        });
    });
});

test('deny unfriend - target user does not exist', (done: jest.DoneCallback) => {
  const unique = Date.now().toString(36);
  const fakeUserId = 'nonexistent-user-id';

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

      // Try to unfriend non-existent user
      request(app)
        .delete(`/user/unfriend/${fakeUserId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
        .expect((res) => {
          expect(res.body.error).toBeDefined();
          expect(res.body.error).toBe('User not found');
        })
        .end(done);
    });
});

test('deny unfriend - not friends with user', (done: jest.DoneCallback) => {
  const unique1 = Date.now().toString(36);
  const unique2 = (Date.now() + 1).toString(36);

  // Create first user
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

          const userId2 = signupRes2.body.userId;

          // Try to unfriend without being friends
          request(app)
            .delete(`/user/unfriend/${userId2}`)
            .set('Authorization', `Bearer ${token1}`)
            .expect(400)
            .expect((res) => {
              expect(res.body.error).toBeDefined();
              expect(res.body.error).toBe('You are not friends with this user');
            })
            .end(done);
        });
    });
});

afterAll(async () => {
  await prisma.$disconnect();
});
