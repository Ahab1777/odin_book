import type { PostCardContent } from "../../types/auth";
import PostCard from "../components/PostCard";
import { api } from "../../lib/api";
import { useEffect, useState } from "react";
import type { PostIndexResponse } from "../../types/auth";

export default function MyPosts() {
  const [postIndex, setPostIndex] = useState<PostCardContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      try {
        const res = await api.get<PostIndexResponse>("/user");
        if (!cancelled) {
          setPostIndex(res.posts);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const error = err as Error;
          setError(error.message || "Failed to load posts");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPosts();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main>
      <section>
        <h1 className="text-brown text-center">My Posts</h1>
        {isLoading ? (
          <p>Loading your posts...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : postIndex.length === 0 ? (
          "You have no posts yet"
        ) : (
          postIndex.map((post) => <PostCard key={post.id} {...post} />)
        )}
      </section>
    </main>
  );
}
