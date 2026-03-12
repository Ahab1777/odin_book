import { useState, useEffect } from "react";
import FriendCard from "../community/FriendCard";
import type { FriendsResponse } from "../../../types/community";
import { api } from "../../../lib/api";

interface FriendsContainerProps {
  userId: string;
}

export default function FriendsContainer({ userId }: FriendsContainerProps) {
  const [friends, setFriends] = useState<FriendsResponse>({
    friends: [],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalFriendships: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  });
  const [friendsPage, setFriendsPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadFriends() {
      try {
        const res = await api.get<FriendsResponse>(
          `/friend/friendships/${userId}?page${friendsPage}`,
        );
        if (!cancelled) {
          setFriends(res);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const error = err as Error;
          setError(error.message || "Failed to fetch friends");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadFriends();
    return () => {
      cancelled = true;
    };
  }, [friendsPage, userId]);

  return (
    <>
      {isLoading ? (
        <p className="text-indigo text-center">Loading profile...</p>
      ) : error ? (
        <p className="text-red-600 text-center">{error}</p>
      ) : (
        <div className="profile-friends w-full text-center">
          <h2 className="text-xl font-semibold text-brown">Friends</h2>
          {friends.friends.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 mt-4">
              {friends.friends.map((friend) => (
                <FriendCard key={friend.id} {...friend}></FriendCard>
              ))}
            </div>
          ) : (
            <p className="text-slate mt-2">No friends to display</p>
          )}
          <div className="pagination-controls mt-4">
            <button
              onClick={() => setFriendsPage((prev) => Math.max(prev - 1, 1))}
              disabled={!friends.pagination.hasPreviousPage}
              className="btn btn-primary"
            >
              Previous
            </button>
            <button
              onClick={() => setFriendsPage((prev) => prev + 1)}
              disabled={!friends.pagination.hasNextPage}
              className="btn btn-primary"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
