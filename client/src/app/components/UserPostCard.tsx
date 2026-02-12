import type { PostCardContent } from "../../types/auth";

export default function UserPostCard(post: PostCardContent) {
  //Api postIndex return object example:
  // {
  //   "posts": [
  // {
  //   "id": "post_123",
  //   "title": "My first post",
  //   "content": "This is the content of my first post.",
  //   "userId": "user_abc",
  //   "createdAt": "2026-02-10T12:34:56.789Z",
  //   "updatedAt": "2026-02-10T12:34:56.789Z",
  //   "user": {
  // "id": "user_abc",
  // "username": "alice",
  // "avatar": "https://www.gravatar.com/avatar/abc123..."
  //   }
  // }
  //   ]
  // }

  return (
    <article>
      <header className="grid grid-cols-5 grid-rows-2 items-center gap-2">
        <h2 className="font-bold text-brown col-span-3 row-start-1">
          {post.title}
        </h2>
        <h3 className="text-brown col-span-3 row-start-2">
          {post.user.username}
        </h3>
        <img
          className="col-start-4 col-end-6 row-span-2 justify-self-end rounded-full"
          src={post.user.avatar}
          alt={`${post.user.username}'s avatar`}
        />
      </header>
      <p>{post.content}</p>
      <footer className="text-sm text-slate">
        <time dateTime={post.createdAt}>
          {new Date(post.createdAt).toLocaleString()}
        </time>
      </footer>
    </article>
  );
}
