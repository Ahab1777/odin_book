import express from 'express';
import request from 'supertest';
import { routes } from '../index';
import { prisma } from '../../lib/prisma';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/auth', routes.auth);
app.use('/post', routes.post);
app.use('/comment', routes.comment);

let token: string;
let userId: string;
let postId: string;
let commentId: string;

let validContent: string;
let tooShortContent: string;
let tooLongContent: string;

beforeAll((done: jest.DoneCallback) => {
	const unique = Date.now().toString(36);

	validContent = 'Nice post!';
	tooShortContent = ''; // will fail min length 1 after trim
	tooLongContent = 'x'.repeat(61); // exceeds max 60

	// Sign up a user and get JWT
	request(app)
		.post('/auth/signup')
		.send({
			email: `comment_test_${unique}@example.com`,
			username: `comment_user_${unique}`,
			password: 'Password1',
		})
		.expect(201)
		.end((err, signupRes) => {
			if (err) return done(err);

			token = signupRes.body.token;
			userId = signupRes.body.userId;

			// Create a post for this user to comment on
			request(app)
				.post('/post/create')
				.set('Authorization', `Bearer ${token}`)
				.send({
					title: 'Comment test post',
					content: 'Post content for comment tests',
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

// 1) createComment successfully creates a comment
it('creates a comment for the current user on the target post', (done: jest.DoneCallback) => {
	request(app)
		.post(`/comment/${postId}`)
		.set('Authorization', `Bearer ${token}`)
		.send({ content: validContent })
		.expect(201)
		.end(async (err, res) => {
			if (err) return done(err);

			expect(res.body.id).toBeDefined();
			commentId = res.body.id;
			expect(res.body.userId).toBe(userId);
			expect(res.body.postId).toBe(postId);
			expect(res.body.content).toBe(validContent);
			expect(res.body.createdAt).toBeDefined();

			try {
				const commentCount = await prisma.comment.count({ where: { userId, postId, content: validContent } });
				expect(commentCount).toBe(1);
				done();
			} catch (dbErr) {
				done(dbErr as Error);
			}
		});
});

// 2) createComment returns validation error when content is too short
it('denies comment creation when content is too short', (done: jest.DoneCallback) => {
	request(app)
		.post(`/comment/${postId}`)
		.set('Authorization', `Bearer ${token}`)
		.send({ content: tooShortContent })
		.expect(400)
		.expect((res) => {
			expect(res.body.errors).toBeDefined();
			const contentError = res.body.errors.find((e: any) => e.path === 'content');
			expect(contentError).toBeDefined();
			expect(contentError.msg).toBe('Comment must be between 1 and 60 characters');
		})
		.end(done);
});

// 3) createComment returns validation error when content is too long
it('denies comment creation when content is too long', (done: jest.DoneCallback) => {
	request(app)
		.post(`/comment/${postId}`)
		.set('Authorization', `Bearer ${token}`)
		.send({ content: tooLongContent })
		.expect(400)
		.expect((res) => {
			expect(res.body.errors).toBeDefined();
			const contentError = res.body.errors.find((e: any) => e.path === 'content');
			expect(contentError).toBeDefined();
			expect(contentError.msg).toBe('Comment must be between 1 and 60 characters');
		})
		.end(done);
});

// 4) deleteComment removes the comment when user is authenticated and owner
it('deletes the target comment for the current user', (done: jest.DoneCallback) => {
	request(app)
		.delete(`/comment/${commentId}`)
		.set('Authorization', `Bearer ${token}`)
		.expect(200)
		.end(async (err, res) => {
			if (err) return done(err);

			expect(res.body.message).toBe('Comment deleted successfully');

			try {
				const commentCount = await prisma.comment.count({ where: { id: commentId } });
				expect(commentCount).toBe(0);
				done();
			} catch (dbErr) {
				done(dbErr as Error);
			}
		});
});

// 5) deleteComment fails when user is not authenticated
it('does not delete comment when user is not authenticated', (done: jest.DoneCallback) => {
	// First recreate a comment to ensure one exists
	request(app)
		.post(`/comment/${postId}`)
		.set('Authorization', `Bearer ${token}`)
		.send({ content: validContent })
		.expect(201)
		.end(async (createErr, createRes) => {
			if (createErr) return done(createErr);

			const unauthCommentId = createRes.body.id;

			// Attempt to delete without Authorization header
			request(app)
				.delete(`/comment/${unauthCommentId}`)
				.expect(401)
				.expect(async (res) => {
					expect(res.body.error).toBe('Access token required');

					const commentCount = await prisma.comment.count({ where: { id: unauthCommentId } });
					expect(commentCount).toBe(1);
				})
				.end(done);
		});
});

afterAll(async () => {
	// Cleanup test data
	await prisma.comment.deleteMany({ where: { postId } });
	await prisma.post.deleteMany({ where: { id: postId } });
	await prisma.user.deleteMany({ where: { id: userId } });
	await prisma.$disconnect();
});

