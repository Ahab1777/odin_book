import type { PostCardContent, PostIndexResponse } from '../../types/auth';
import PostCard from '../components/PostCard';
import { api } from '../../lib/api';
import { useEffect, useState } from 'react';

export default function Home() {
  const [postIndex, setPostIndex] = useState<PostCardContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postsPage, setPostsPage] = useState<number>(1);
  const [pagination, setPagination] = useState<{
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>({
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
        setIsLoading(true);
        setError(null);
        const res = await api.get<PostIndexResponse>(
          `/post/index?page=${postsPage}&limit=10`
        );
        if (!cancelled) {
          setPostIndex(res.posts);
          if (res.pagination) setPagination(res.pagination);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const error = err as Error;
          setError(error.message || 'Failed to load posts');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPosts();
    return () => {
      cancelled = true;
    };
  }, [postsPage]);

  return (
    <main
      className='
    font-funnel
    min-h-screen
      '
    >
      <section
        className='
      flex 
      flex-col 
      gap-3
      px-4
        '
      >
        <h1
          className='
        text-text
        text-3xl
        text-center
        m-5
        '
        >
          Home Feed
        </h1>
        {isLoading ? (
          <p
            className='
        text-center
            '
          >Loading posts...</p>
        ) : error ? (
          <p className='text-red-600 text-center'>{error}</p>
        ) : postIndex.length === 0 ? (
          'You have no posts yet'
        ) : (
          <>
            {postIndex.map((post) => (
              <PostCard key={post.id} {...post} />
            ))}

            <div className='mt-4 flex justify-center gap-4 w-full mb-4'>
              <button
                type='button'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPostsPage((prev) => Math.max(prev - 1, 1));
                }}
                disabled={!pagination.hasPreviousPage}
                className={`prev-next-btn ${pagination.hasPreviousPage ? 'prev-next-btn-enabled' : 'prev-next-btn-disabled'}`}
              >
                Previous
              </button>
              <button
                type='button'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPostsPage((prev) => prev + 1);
                }}
                disabled={!pagination.hasNextPage}
                className={`prev-next-btn ${pagination.hasNextPage ? 'prev-next-btn-enabled' : 'prev-next-btn-disabled'}`}
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
