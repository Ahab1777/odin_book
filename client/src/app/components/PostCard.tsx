import type { PostCardContent } from "../../types/content";
import { Link } from "react-router";

export default function PostCard(post: PostCardContent) {
  return (
    <article>
      <header className="grid grid-cols-5 grid-rows-2 items-center gap-2">
        <h2 className="font-bold text-brown col-span-3 row-start-1">
          {post.title}
        </h2>
        <Link to={`/profile/${post.userId}`}>
          <h3 className="text-brown col-span-3 row-start-2">
            {post.user.username}
          </h3>
        </Link>
        <Link to={`/profile/${post.userId}`}>
          <img
            className="col-start-4 col-end-6 row-span-2 justify-self-end rounded-full"
            src={post.user.avatar}
            alt={`${post.user.username}'s avatar`}
          />
        </Link>
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
