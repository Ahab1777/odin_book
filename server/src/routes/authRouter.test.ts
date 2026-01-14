import authRouter from "./authRouter";
import request from 'supertest';
import express from 'express';

const app = express();
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));
app.use("/", authRouter);


test("sign-up works", (done: jest.DoneCallback) => {
  const suffix = Date.now().toString(36); // simple unique-ish string

  const username = `ahab_${suffix}`;
  const email = `user_${suffix}@example.com`;
  const password = `Q1w2e3r4_${suffix}`;

  request(app)
    .post("/")
    .send({ password, username, email })
    .expect(201)
    .expect((res) => {
        expect(res.body.username).toBe(username);
        expect(res.body.token).toBeDefined();
        expect(typeof res.body.token).toBe('string');
        expect(res.body.userId).toBeDefined();
        expect(typeof res.body.userId).toBe('string');
    })
    .end(done);
});