import express from "express";
import request from "supertest";
import authRouter from "../authRouter";
import bioRouter from "../bioRouter";
import { prisma } from "../../lib/prisma";
import friendUtils from "../testUtils/friendUtils";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/auth", authRouter);
app.use("/bio", bioRouter);

test("getBio returns correct bio for given user", async () => {
  const user = await friendUtils.signupUser("bio_get");

  const desiredBio = "This is my awesome bio";

  await prisma.profile.update({
    where: { userId: user.id },
    data: { bio: desiredBio },
  });

  const res = await request(app)
    .get(`/bio/${user.id}`)
    .set("Authorization", `Bearer ${user.token}`)
    .expect(200);

  expect(res.body.bio).toBe(desiredBio);
});

test("editBio updates the authenticated user's bio when within limits", async () => {
  const user = await friendUtils.signupUser("bio_edit_ok");

  const newBio = "Short bio within allowed length";

  const res = await request(app)
    .put("/bio/")
    .set("Authorization", `Bearer ${user.token}`)
    .send({ bio: newBio })
    .expect(200);

  expect(res.body.profile).toBe(newBio);

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  expect(profile).not.toBeNull();
  expect(profile!.bio).toBe(newBio);
});

test("editBio rejects bios longer than 250 characters and does not change existing bio", async () => {
  const user = await friendUtils.signupUser("bio_edit_long");

  const originalBio = "Original bio text";

  await prisma.profile.update({
    where: { userId: user.id },
    data: { bio: originalBio },
  });

  const tooLongBio = "a".repeat(251);

  const res = await request(app)
    .put("/bio/")
    .set("Authorization", `Bearer ${user.token}`)
    .send({ bio: tooLongBio })
    .expect(400);

  expect(res.body.errors).toBeDefined();
  expect(Array.isArray(res.body.errors)).toBe(true);

  const bioError = res.body.errors.find((e: any) => e.path === "bio");
  expect(bioError).toBeDefined();
  expect(bioError.msg).toBe("Maximum bio size is 250 characters");

  const profileAfter = await prisma.profile.findUnique({
    where: { userId: user.id },
  });

  expect(profileAfter).not.toBeNull();
  expect(profileAfter!.bio).toBe(originalBio);
});

afterAll(async () => {
  await prisma.$disconnect();
});
