import authRouter from "./authRouter";
import request from 'supertest';
import express from 'express';

const app = express();
app.use(express.json()); // Add this
app.use(express.urlencoded({ extended: false }));
app.use("/", authRouter);

test("sign-up works", (done: jest.DoneCallback) => {
    request(app)
        .post("/")
        .send({
            password: "Q1w2e3r4",
            username: 'ahab1777',
            email: "qwerty@azx.com"
        })
        // .expect(201)
        // .expect((res) => {
        //     expect(res.body.username).toBe('ahab1777');
        //     expect(res.body.email).toBe("qwerty@azx.com");
        //     expect(res.body.token).toBeDefined();
        //     expect(res.body.userId).toBeDefined();
        // })
        .end(done);
});