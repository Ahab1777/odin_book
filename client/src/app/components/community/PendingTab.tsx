import { useEffect, useState } from 'react';
import type { PendingRequestsResponse } from '../../../types/community';
import { api } from '../../../lib/api';
import type { BasicUser } from '../../../types/auth';
import PendingCard from './PendingCard';

export default function PendingTab() {
  const [pendingRequests, setPendingRequests] = useState<BasicUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPendingRequests() {
      try {
        const res = await api.get<PendingRequestsResponse>(
          `/friend/requests/incoming?page=${page}&limit=${limit}`
        );
        if (!cancelled) {
          setPendingRequests(res.pendingRequests);
          setHasNextPage(res.pagination.hasNextPage);
          setHasPreviousPage(res.pagination.hasPreviousPage);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const error = err as Error;
          setError(error.message || 'Failed to load pending requests');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadPendingRequests();
    return () => {
      cancelled = true;
    };
  }, [page, limit]);

  //handle page change
  const handleNextPage = () => {
    setPage((p) => p + 1);
  };

  const handlePreviousPage = () => {
    setPage((p) => Math.max(1, p - 1));
  };

  // Callback to remove a request from the list
  const handleRequestUpdate = (id: string) => {
    setPendingRequests((prev) => prev.filter((request) => request.id !== id));
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
          Loading pending friendships...
        </p>
      ) : error ? (
        <p className='text-red-600 text-center'>{error}</p>
      ) : pendingRequests.length === 0 ? (
        <p className='text-red-600 text-center'>You have no pending requests</p>
      ) : (
        <div
          className='
                grid grid-cols-1 grid-rows-10 sm:grid-cols-2 sm:grid-rows-5 gap-2 sm:h-100
                  '
        >
          {pendingRequests.map((request) => (
            <PendingCard
              key={request.id}
              {...request}
              onRequestUpdate={handleRequestUpdate}
            />
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
