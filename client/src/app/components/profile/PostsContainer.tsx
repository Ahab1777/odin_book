import { useState, useEffect } from "react";
import type { GetUserPostsResponse } from "../../../types/content";
import { api } from "../../../lib/api";
import ProfilePostCard from "./ProfilePostCard";


interface PostsContainerProps {
  userId: string;
}

export default function PostsContainer({userId}: PostsContainerProps) {
  const [posts, setPosts] = useState<GetUserPostsResponse>({
    posts: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalPosts: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  });

  const [postsPage, setPostsPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      try {
        const res = await api.get<GetUserPostsResponse>(
          `/post/all/${userId}?page=${postsPage}&limit=5`,
        );
        if (!cancelled) {
          setPosts(res);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const error = err as Error;
          setError(error.message || "Failed to fetch posts");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }

    }
    loadPosts();
    return () => {
      cancelled = true;
    };
  }, [postsPage, posts, userId]);

  return (
    <div>
      {isLoading ? (
        <p className="text-indigo text-center">Loading profile...</p>
      ) : error ? (
        <p className="text-red-600 text-center">{error}</p>
      ) : posts.posts.length > 0 ? (
        <ul className="space-y-4 mt-4">
          {posts.posts.map((post) => (
            <ProfilePostCard key={post.id} {...post} />
          ))}
        </ul>
      ) : (
        <p className="text-slate mt-2">No posts yet</p>
      )}
      <div className="pagination-controls mt-4">
        <button
          onClick={() => setPostsPage((prev) => Math.max(prev - 1, 1))}
          disabled={!posts.pagination.hasPreviousPage}
          className="btn btn-primary"
        >
          Previous
        </button>
        <button
          onClick={() => setPostsPage((prev) => prev + 1)}
          disabled={!posts.pagination.hasNextPage}
          className="btn btn-primary"
        >
          Next
        </button>
      </div>
    </div>
  );
}
