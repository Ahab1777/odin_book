import type { UserPostCardContent } from "../../types/auth";
import UserPostCard from "../components/UserPostCard";
import { api } from "../../lib/api";
import { useEffect, useState } from "react";
import type { UserPostIndexResponse } from "../../types/auth";

export default function MyPosts() {
  const [postIndex, setPostIndex] = useState<UserPostCardContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      try {
        const res = await api.get<UserPostIndexResponse>("/post/user");
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
          postIndex.map((post) => <UserPostCard key={post.id} {...post} />)
        )}
      </section>
    </main>
  );
}
