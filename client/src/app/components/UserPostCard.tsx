import type { UserPostCardContent } from "../../types/auth";

export default function UserPostCard(post: UserPostCardContent) {
  return (
    <article>
      <header className="grid grid-cols-2 grid-rows-1 items-center gap-2">
        <h2 className="font-bold text-brown col-span-1">{post.title}</h2>
        <time className="font-bold text-brown" dateTime={post.createdAt}>
          {new Date(post.createdAt).toLocaleString()}
        </time>
      </header>
      <p>{post.content}</p>
      <footer className="mt-2 flex items-center justify-end gap-4 text-sm text-slate">
        <span>💬 {post.comments.length}</span>
        <span>❤️ {post.likes.length}</span>
      </footer>
    </article>
  );
}
