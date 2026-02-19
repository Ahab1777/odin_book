import { useEffect, useState } from "react";
import type { FriendsResponse } from "../../../types/community";
import FriendCard from "./FriendCard";
import { api } from "../../../lib/api";
import type { BasicUser } from "../../../types/auth";

export default function FriendsTab() {
  const [friends, setFriends] = useState<BasicUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    

    useEffect(() => {
        let cancelled = false;

        async function loadFriends() {
            try {
                const res = await api.get<FriendsResponse>("/friend/friendships");
                if (!cancelled) {
                    setFriends(res.friendships)
                }
            } catch (err: unknown) {
                if (!cancelled) {
                    const error = err as Error;
                    setError(error.message || "Failed to load friends")
                }
            } finally {
                if(!cancelled) setIsLoading(false)
            }
        }

        loadFriends();
        return () => {
            cancelled = true;
        }
    })

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
    </>
  );
}
