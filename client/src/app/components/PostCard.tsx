import { useState, useEffect } from "react";
import type { PostCardContent, Like, Comment } from "../../types/content";
import { Link } from "react-router";
import { useAuth } from "../auth";
import { api } from "../../lib/api";

type PostWithExtras = PostCardContent & {
  likes?: Like[];
  comments?: Comment[];
};

export default function PostCard(post: PostWithExtras) {
  const { user } = useAuth();

  const [likes, setLikes] = useState<Like[]>(post.likes ?? []);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLikes(post.likes ?? []);
  }, [post.likes]);

  useEffect(() => {
    setIsLiked(Boolean(user && likes.some((l) => l.userId === user.id)));
  }, [likes, user]);

  async function toggleLike() {
    if (!user) return;
    setLoading(true);
    try {
      if (isLiked) {
        await api.delete(`/like/${post.id}`);
        setLikes((prev) => prev.filter((l) => l.userId !== user.id));
      } else {
        const created = await api.post<{ id: string; userId: string; postId: string; createdAt: string }>(
          `/like/${post.id}`,
        );
        setLikes((prev) => [...prev, { id: created.id, userId: created.userId, postId: created.postId, createdAt: created.createdAt }]);
      }
    } catch (err) {
      console.error("Like toggle failed", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <article>
      <header className="grid grid-cols-5 grid-rows-2 items-center gap-2">
        <h2 className="font-bold text-brown col-span-3 row-start-1">{post.title}</h2>
        <Link to={`/profile/${post.userId}`}>
          <h3 className="text-brown col-span-3 row-start-2">{post.user.username}</h3>
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
      <footer className="text-sm text-slate flex items-center justify-between">
        <time dateTime={post.createdAt}>{new Date(post.createdAt).toLocaleString()}</time>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleLike}
            disabled={loading}
            aria-pressed={isLiked}
            className={`px-2 py-1 rounded ${isLiked ? "text-red-600" : "text-slate"}`}
            title={isLiked ? "Unlike" : "Like"}
          >
            {isLiked ? "♥" : "♡"}
          </button>
          <span>{likes.length}</span>
        </div>
      </footer>
    </article>
  );
}
