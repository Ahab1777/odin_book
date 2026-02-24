import { useEffect, useState } from "react";
import type { UnknownUsersResponse } from "../../../types/community";
import { api } from "../../../lib/api";
import type { BasicUser } from "../../../types/auth";
import UnknownCard from "./UnknownCard";

export default function UnknownTab() {
  const [unknownUsers, setUnknownUsers] = useState<BasicUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadUnknownUsers() {
      try {
        const res = await api.get<UnknownUsersResponse>(
          `/friend/unknown?page=${page}&limit=${limit}`,
        );
        if (!cancelled) {
          setUnknownUsers(res.unknownUsers);
          setHasNextPage(res.pagination.hasNextPage);
          setHasPreviousPage(res.pagination.hasPreviousPage);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const error = err as Error;
          setError(error.message || "Failed to load user list");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadUnknownUsers();
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
    setUnknownUsers((prev) => prev.filter((request) => request.id !== id));
  };

  return (
    <>
      {isLoading ? (
        <p>Loading unknown users...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : unknownUsers.length === 0 ? (
        <p className="text-red-600">There are no potential new friends</p>
      ) : (
        unknownUsers.map((user) => (
          <UnknownCard
            key={user.id}
            {...user}
            onRequestUpdate={handleRequestUpdate}
          />
        ))
      )}
      <div className="flex justify-center gap-4">
        <button
          onClick={handlePreviousPage}
          disabled={!hasPreviousPage}
          className={`px-4 py-2 text-lg font-bold  transition-transform ${
            hasPreviousPage
              ? "bg-blue-500 text-white hover:scale-110"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <title>arrow-left-bold</title>
            <path d="M20,9V15H12V19.84L4.16,12L12,4.16V9H20Z" />
          </svg>
        </button>
        <button
          onClick={handleNextPage}
          disabled={!hasNextPage}
          className={`px-4 py-2 text-lg font-bold  transition-transform ${
            hasNextPage
              ? "bg-blue-500 text-white hover:scale-110"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <title>arrow-right-bold</title>
            <path d="M4,15V9H12V4.16L19.84,12L12,19.84V15H4Z" />
          </svg>
        </button>
      </div>
    </>
  );
}
