import { useEffect, useState } from "react";
import type { FriendsResponse } from "../../../types/community";
import FriendCard from "./FriendCard";
import { api } from "../../../lib/api";
import type { BasicUser } from "../../../types/auth";
import { useAuth } from "../../auth";

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
          `/friend/friendships/${userId}?page=${page}&limit=${limit}`,
        );

        if (!cancelled) {
          setFriends(res.friends);
          setHasNextPage(res.pagination.hasNextPage);
          setHasPreviousPage(res.pagination.hasPreviousPage);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const error = err as Error;
          setError(error.message || "Failed to load friends");
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
    <>
      {isLoading ? (
        <p>Loading friends...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : friends.length === 0 ? (
        <p className="text-red-600">You have no friends yet</p>
      ) : (
        friends.map((friend) => <FriendCard key={friend.id} {...friend} />)
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
