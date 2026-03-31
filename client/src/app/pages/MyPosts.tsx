import type { UserPostCardContent } from "../../types/auth";
import UserPostCard from "../components/UserPostCard";
import { api } from "../../lib/api";
import { useEffect, useState } from "react";
import type { UserPostIndexResponse } from "../../types/auth";

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalPosts: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function MyPosts() {
  const [postIndex, setPostIndex] = useState<UserPostCardContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postsPage, setPostsPage] = useState<number>(1);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalPosts: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      try {
        const res = await api.get<UserPostIndexResponse>(
          `/post/user?page=${postsPage}&limit=10`,
        );
        if (!cancelled) {
          setPostIndex(res.posts);
          setPagination(res.pagination);
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
  }, [postsPage, pagination]);

  return (
    <main>
      <section>
        <h1 className="text-brown text-center">My Posts</h1>
        {typeof window !== "undefined" &&
        localStorage.getItem("isDemo") === "true" ? (
          "Sorry, demo users cannot create posts!"
        ) : isLoading ? (
          <p>Loading your posts...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : postIndex.length === 0 ? (
          "You have no posts yet"
        ) : (
          <div>
            {postIndex.map((post) => (
              <UserPostCard key={post.id} {...post} />
            ))}
            <div className="pagination-controls mt-4">
              <button
                onClick={() => setPostsPage((prev) => Math.max(prev - 1, 1))}
                disabled={!pagination.hasPreviousPage}
                className="btn btn-primary"
              >
                Previous
              </button>
              <button
                onClick={() => setPostsPage((prev) => prev + 1)}
                disabled={!pagination.hasNextPage}
                className="btn btn-primary"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
