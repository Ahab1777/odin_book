import authRouter from "../authRouter";
import request from "supertest";
import express from "express";
import { prisma } from "../../lib/prisma";
import { normalizeAppEmail } from "../../lib/email";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", authRouter);

//Test users
type TestUser = {
  id: string;
  email: string;
  username: string;
  password: string; // plain, for login tests
};

let username: string;
let email: string;
let password: string;
let invalidUsername: string;
let invalidEmail: string;
let invalidPassword: string;

beforeAll(() => {
  const suffix = Date.now().toString(36); // simple unique-ish string
  username = `ahab_${suffix}`;
  email = `user.${suffix}@gmail.com`;
  password = `Q1w2e3r4_${suffix}`;

  const invalidSuffix = Date.now().toString(36); // simple unique-ish string
  invalidUsername = `ahab_${invalidSuffix}`;
  invalidEmail = `user.${invalidSuffix}@gmail.com`;
  invalidPassword = `Q1w2e3r4_${invalidSuffix}`;
});

beforeAll(async () => {
  const demoSuffix = Date.now().toString(36);
  const demoEmail = `demo.${demoSuffix}@gmail.com`;
  const demoUsername = `demo_user_${demoSuffix}`;

  process.env.DEMO_USER_EMAIL = demoEmail;
  process.env.DEMO_USER_USERNAME = demoUsername;
  process.env.DEMO_USER_PASSWORD = "DemoPassword123";

  await prisma.user.deleteMany({ where: { email: demoEmail } });
});

test("sign-up works", (done: jest.DoneCallback) => {
  request(app)
    .post("/signup")
    .send({ password, username, email })
    .expect(201)
    .expect((res) => {
      expect(res.body.username).toBe(username);
      expect(res.body.token).toBeDefined();
      expect(typeof res.body.token).toBe("string");
      expect(res.body.userId).toBeDefined();
      expect(typeof res.body.userId).toBe("string");
      expect(res.body.avatar).toBeDefined();
      expect(typeof res.body.avatar).toBe("string");
    })
    .end(done);
});

test("signup fails with invalid email", (done: jest.DoneCallback) => {
  request(app)
    .post("/signup")
    .send({
      email: "invalid-email", // Invalid format
      username,
      password,
    })
    .expect(400)
    .expect((res) => {
      expect(res.body.errors).toBeDefined();
      expect(Array.isArray(res.body.errors)).toBe(true);
      expect(res.body.errors.length).toBeGreaterThan(0);
      // Check for specific error message
      expect(res.body.errors[0].msg).toBe("Invalid e-mail format");
      expect(res.body.errors[0].path).toBe("email");
    })
    .end(done);
});

test("signup fails if email already taken", (done: jest.DoneCallback) => {
  request(app)
    .post("/signup")
    .send({
      email: email, // Using email from beforeAll (already exists)
      username,
      password,
    })
    .expect(400)
    .expect((res) => {
      expect(res.body.errors).toBeDefined();

      // Find the email error
      const emailError = res.body.errors.find((e: any) => e.path === "email");
      expect(emailError).toBeDefined();
      expect(emailError.msg).toBe("Email already registered");
    })
    .end(done);
});

test("signup fails with weak password", (done: jest.DoneCallback) => {
  request(app)
    .post("/signup")
    .send({
      email: "new.user@gmail.com",
      username: "signupfailweakpassword",
      password: "weak", // Too short, no uppercase, no number
    })
    .expect(400)
    .expect((res) => {
      expect(res.body.errors.length).toBeGreaterThanOrEqual(3);

      const messages = res.body.errors.map((e: any) => e.msg);
      expect(messages).toContain("Password must be at least 8 characters");
      expect(messages).toContain("Password must contain an uppercase letter");
      expect(messages).toContain("Password must contain a number");
    })
    .end(done);
});

test("login works", (done) => {
  request(app)
    .post("/login")
    .send({
      email,
      password,
    })
    .expect(200)
    .expect((res) => {
      expect(res.body.token).toBeDefined();
      expect(typeof res.body.token).toBe("string");
      expect(res.body.userId).toBeDefined();
      expect(typeof res.body.userId).toBe("string");
      expect(res.body.username).toBeDefined();
      expect(typeof res.body.username).toBe("string");
      expect(res.body.email).toBeDefined();
      expect(typeof res.body.email).toBe("string");
      expect(res.body.avatar).toBeDefined();
      expect(typeof res.body.email).toBe("string");
    })
    .end(done);
});

test("login fails with invalid email format", (done: jest.DoneCallback) => {
  request(app)
    .post("/login")
    .send({
      email: "not-an-email",
      password: password,
    })
    .expect(400)
    .expect((res) => {
      expect(res.body.errors).toBeDefined();
      expect(Array.isArray(res.body.errors)).toBe(true);

      const emailError = res.body.errors.find((e: any) => e.path === "email");
      expect(emailError).toBeDefined();
      expect(emailError.msg).toBe("Invalid email format");
    })
    .end(done);
});

test("login fails with missing password", (done: jest.DoneCallback) => {
  request(app)
    .post("/login")
    .send({
      email: email,
      // password is missing
    })
    .expect(400)
    .expect((res) => {
      expect(res.body.errors).toBeDefined();

      const passwordError = res.body.errors.find(
        (e: any) => e.path === "password",
      );
      expect(passwordError).toBeDefined();
      expect(passwordError.msg).toBe("Password is required");
    })
    .end(done);
});

test("login fails with incorrect password", (done: jest.DoneCallback) => {
  request(app)
    .post("/login")
    .send({
      email: email,
      password: "WrongPassword123",
    })
    .expect(401)
    .expect((res) => {
      expect(res.body.error).toBe("Invalid email or password");
    })
    .end(done);
});

test("login fails with nonexistent email", (done: jest.DoneCallback) => {
  request(app)
    .post("/login")
    .send({
      email: "does.not.exist@gmail.com",
      password: "SomePassword123",
    })
    .expect(401)
    .expect((res) => {
      expect(res.body.error).toBe("Invalid email or password");
    })
    .end(done);
});

test("demo-login creates demo user and returns token", async () => {
  const demoEmail = process.env.DEMO_USER_EMAIL as string;
  const demoUsername = process.env.DEMO_USER_USERNAME as string;

  const normalizedDemoEmail = normalizeAppEmail(demoEmail);

  const res = await request(app).post("/demo-login").send().expect(200);

  expect(res.body.token).toBeDefined();
  expect(typeof res.body.token).toBe("string");
  expect(res.body.userId).toBeDefined();
  expect(typeof res.body.userId).toBe("string");
  expect(res.body.username).toBe(demoUsername);
  expect(res.body.email).toBe(normalizedDemoEmail);
  expect(res.body.avatar).toBeDefined();
  expect(typeof res.body.avatar).toBe("string");

  const demoUserInDb = await prisma.user.findUnique({
    where: { email: normalizedDemoEmail },
  });
  expect(demoUserInDb).not.toBeNull();
  expect(demoUserInDb?.username).toBe(demoUsername);
});

test("demo-login reuses the same demo user", async () => {
  const first = await request(app).post("/demo-login").send().expect(200);
  const second = await request(app).post("/demo-login").send().expect(200);

  expect(first.body.userId).toBe(second.body.userId);

  const demoEmail = process.env.DEMO_USER_EMAIL as string;
  const normalizedDemoEmail = normalizeAppEmail(demoEmail);
  const count = await prisma.user.count({
    where: { email: normalizedDemoEmail },
  });
  expect(count).toBe(1);
});



// test("password change succeeds with valid token", async () => {
//   const suffix = Date.now().toString(36);
//   const testEmail = `pw.change.${suffix}@gmail.com`;
//   const normalizedEmail = normalizeAppEmail(testEmail);
//   const testUsername = `pwchange_user_${suffix}`;
//   const originalPassword = `OldPass1_${suffix}`;
//   const newPassword = `NewPass2_${suffix}`;

//   // Ensure clean state
//   await prisma.passwordReset.deleteMany({
//     where: { user: { email: normalizedEmail } },
//   });
//   await prisma.user.deleteMany({ where: { email: normalizedEmail } });

//   // Create the account via the signup route
//   await request(app)
//     .post("/signup")
//     .send({
//       email: testEmail,
//       username: testUsername,
//       password: originalPassword,
//     })
//     .expect(201);

//   const user = await prisma.user.findUnique({
//     where: { email: normalizedEmail },
//   });
//   expect(user).not.toBeNull();

//   // Request password reset to generate a token
//   await request(app)
//     .post("/password-reset")
//     .send({ email: testEmail })
//     .expect(200);

//   const resetEntry = await prisma.passwordReset.findFirst({
//     where: { userId: user!.id },
//     orderBy: { createdAt: "desc" },
//   });

//   expect(resetEntry).not.toBeNull();

//   // Change password using the token
//   await request(app)
//     .post("/password-change")
//     .send({ token: resetEntry!.token, password: newPassword })
//     .expect(200)
//     .expect((res) => {
//       expect(res.body.message).toBe("Password changed successfully");
//     });

//   // Login with new password works
//   await request(app)
//     .post("/login")
//     .send({ email: testEmail, password: newPassword })
//     .expect(200);

//   // Login with old password fails
//   await request(app)
//     .post("/login")
//     .send({ email: testEmail, password: originalPassword })
//     .expect(401);

//   // All reset tokens for this user should be removed
//   const remainingTokens = await prisma.passwordReset.count({
//     where: { userId: user!.id },
//   });
//   expect(remainingTokens).toBe(0);

//   // Cleanup: delete profile and user
//   await prisma.profile.deleteMany({ where: { userId: user!.id } });
//   await prisma.user.delete({ where: { id: user!.id } });
// });

// test("password change is denied with invalid token", async () => {
//   const fakeToken = "123e4567-e89b-12d3-a456-426614174000";

//   // Ensure no reset entry exists with this token
//   await prisma.passwordReset.deleteMany({ where: { token: fakeToken } });

//   const res = await request(app)
//     .post("/password-change")
//     .send({ token: fakeToken, password: "ValidPass1" })
//     .expect(400);

//   expect(res.body.error).toBe("Invalid or expired token");
// });

// test("password change is denied when password does not meet requirements", async () => {
//   const suffix = Date.now().toString(36);
//   const testEmail = `pw.weak.${suffix}@gmail.com`;
//   const normalizedEmail = normalizeAppEmail(testEmail);
//   const testUsername = `pwweak_user_${suffix}`;
//   const originalPassword = `Strong1_${suffix}`;
//   const weakPassword = "weak"; // too short, no uppercase, no number

//   // Ensure clean state
//   await prisma.passwordReset.deleteMany({
//     where: { user: { email: normalizedEmail } },
//   });
//   await prisma.user.deleteMany({ where: { email: normalizedEmail } });

//   // Create the account via the signup route
//   await request(app)
//     .post("/signup")
//     .send({
//       email: testEmail,
//       username: testUsername,
//       password: originalPassword,
//     })
//     .expect(201);

//   const user = await prisma.user.findUnique({
//     where: { email: normalizedEmail },
//   });
//   expect(user).not.toBeNull();

//   // Request password reset to generate a token
//   await request(app)
//     .post("/password-reset")
//     .send({ email: testEmail })
//     .expect(200);

//   const resetEntry = await prisma.passwordReset.findFirst({
//     where: { userId: user!.id },
//     orderBy: { createdAt: "desc" },
//   });

//   expect(resetEntry).not.toBeNull();

//   // Attempt password change with weak password
//   const res = await request(app)
//     .post("/password-change")
//     .send({ token: resetEntry!.token, password: weakPassword })
//     .expect(400);

//   expect(res.body.errors).toBeDefined();
//   const messages = res.body.errors.map((e: any) => e.msg);
//   expect(messages).toContain("Password must be at least 8 characters");
//   expect(messages).toContain("Password must contain an uppercase letter");
//   expect(messages).toContain("Password must contain a number");

//   // Original password should still work
//   await request(app)
//     .post("/login")
//     .send({ email: testEmail, password: originalPassword })
//     .expect(200);

//   // Cleanup: delete password reset entries, profile, and user
//   await prisma.passwordReset.deleteMany({ where: { userId: user!.id } });
//   await prisma.profile.deleteMany({ where: { userId: user!.id } });
//   await prisma.user.delete({ where: { id: user!.id } });
// });

//Close prisma client so Jest doesn't complain
afterAll(async () => {
  await prisma.$disconnect();
});
