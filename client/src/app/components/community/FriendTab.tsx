import { useEffect, useState } from 'react';
import type { FriendsResponse } from '../../../types/community';
import FriendCard from './FriendCard';
import { api } from '../../../lib/api';
import type { BasicUser } from '../../../types/auth';
import { useAuth } from '../../auth';

export default function FriendsTab() {
  const [friends, setFriends] = useState<BasicUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const { user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    let cancelled = false;

    async function loadFriends() {
      try {
        const res = await api.get<FriendsResponse>(
          `/friend/friendships/${userId}?page=${page}&limit=${limit}`
        );

        if (!cancelled) {
          setFriends(res.friends);
          setHasNextPage(res.pagination.hasNextPage);
          setHasPreviousPage(res.pagination.hasPreviousPage);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const error = err as Error;
          setError(error.message || 'Failed to load friends');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadFriends();
    return () => {
      cancelled = true;
    };
  }, [limit, page, userId]);

  //handle page change
  const handleNextPage = () => {
    setPage((p) => p + 1);
  };

  const handlePreviousPage = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  return (
    <div
      className='
    font-funnel
      '
    >
      {typeof window !== 'undefined' &&
      localStorage.getItem('isDemo') === 'true' ? (
        'Demo user cannot befriend users'
      ) : isLoading ? (
        <p
          className='
          text-center
            '
        >
          Loading friends...
        </p>
      ) : error ? (
        <p className='text-red-600 text-center'>{error}</p>
      ) : friends.length === 0 ? (
        <p className='text-red-600 text-center'>You have no friends yet</p>
      ) : (
                <div
                  className='
                grid grid-cols-1 grid-rows-10 sm:grid-cols-2 sm:grid-rows-5 gap-2 sm:h-100
                  '
                >
          {friends.map((friend) => (
            <FriendCard key={friend.id} {...friend} />
          ))}
        </div>
      )}
      <div
        className='
      flex
      justify-center
      gap-4
      py-4
      '
      >
        <button
          onClick={handlePreviousPage}
          disabled={!hasPreviousPage}
          className={` 
            prev-next-btn
            ${
              hasPreviousPage
                ? 'prev-next-btn-enabled'
                : 'prev-next-btn-disabled'
            }`}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            width='24'
            height='24'
          >
            <title>Previous page</title>
            <path d='M20,9V15H12V19.84L4.16,12L12,4.16V9H20Z' />
          </svg>
        </button>
        <button
          onClick={handleNextPage}
          disabled={!hasNextPage}
          className={`
            prev-next-btn
            
            ${
              hasNextPage ? 'prev-next-btn-enabled' : 'prev-next-btn-disabled'
            }`}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            width='24'
            height='24'
          >
            <title>Next page</title>
            <path d='M4,15V9H12V4.16L19.84,12L12,19.84V15H4Z' />
          </svg>
        </button>
      </div>
    </div>
  );
}
