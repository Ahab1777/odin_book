import { useEffect, useState } from "react";
import type { UnknownUsersResponse } from "../../../types/community";
import { api } from "../../../lib/api";
import type { BasicUser } from "../../../types/auth";
import UnknownCard from "./UnknownCard";

export default function UnknownTab() {
  const [unknownUsers, setUnknownUsers] = useState<BasicUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUnknownUsers() {
      try {
        const res = await api.get<UnknownUsersResponse>("/friend/unknown");
        if (!cancelled) {
          setUnknownUsers(res.unknownUsers);
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
  }, []);

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
    </>
  );
}
