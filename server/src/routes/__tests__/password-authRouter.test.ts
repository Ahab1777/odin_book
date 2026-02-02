import authRouter from "../authRouter";
import request from "supertest";
import express from "express";
import { prisma } from "../../lib/prisma";
import { normalizeAppEmail } from "../../lib/email";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", authRouter);

test("password reset request for an existing user creates reset entry", async () => {
  const testEmail = "odin.project.helper@gmail.com";
  const testUsername = `pwreset_${Date.now().toString(36)}`;
  const testPassword = "Q1w2e3r4!PwReset";

  
  // Create the account via the signup route
  await request(app)
    .post("/signup")
    .send({
      email: testEmail,
      username: testUsername,
      password: testPassword,
    })
    .expect(201);

  const normalizedEmail = normalizeAppEmail(testEmail)
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  expect(user).not.toBeNull();

  // Send password reset request
  const res = await request(app)
    .post("/password-reset")
    .send({ email: testEmail })
    .expect(200);

  expect(res.body.message).toBe("If that email exists, a reset link was sent");

  // Verify a password reset entry was created
  const resetEntries = await prisma.passwordReset.findMany({
    where: { userId: user!.id },
  });
  expect(resetEntries.length).toBeGreaterThan(0);

  // Cleanup: delete password reset entries, profile, and user
  await prisma.passwordReset.deleteMany({ where: { userId: user!.id } });
  await prisma.profile.deleteMany({ where: { userId: user!.id } });
  await prisma.user.delete({ where: { id: user!.id } });
});

