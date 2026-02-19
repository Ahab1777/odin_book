import { useEffect, useState } from "react";
import type { PendingRequestsResponse } from "../../../types/community";
import { api } from "../../../lib/api";
import type { BasicUser } from "../../../types/auth";
import PendingCard from "./PendingCard";

export default function PendingTab() {
  const [pendingRequests, setPendingRequests] = useState<BasicUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    

    useEffect(() => {
        let cancelled = false;

        async function loadPendingRequests() {
            try {
                const res = await api.get<PendingRequestsResponse>("/requests/incoming");
                if (!cancelled) {
                    setPendingRequests(res.pendingRequests)
                }
            } catch (err: unknown) {
                if (!cancelled) {
                    const error = err as Error;
                    setError(error.message || "Failed to load pending requests")
                }
            } finally {
                if(!cancelled) setIsLoading(false)
            }
        }

        loadPendingRequests();
        return () => {
            cancelled = true;
        }
    })

  return (
    <>
      {isLoading ? (
        <p>Loading pending friendships...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : pendingRequests.length === 0 ? (
        <p className="text-red-600">You have no friends yet</p>
      ) : (
        pendingRequests.map((request) => <PendingCard key={request.id} {...request} />)
      )}
    </>
  );
}
