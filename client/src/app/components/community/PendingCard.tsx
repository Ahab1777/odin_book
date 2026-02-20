import { useState } from "react";
import type { BasicUser } from "../../../types/auth";
import { api } from "../../../lib/api";
import type { CreateFriendshipResponse } from "../../../types/community";

interface PendingCardProps extends BasicUser {
  onRequestUpdate: (id: string) => void; // Callback prop
}

export default function PendingCard({
  id,
  username,
  avatar,
  onRequestUpdate,
}: PendingCardProps) {
  //   const [rejectError, setRejectError] = useState("");
  //   const [acceptError, setAcceptError] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const handleAccept: React.MouseEventHandler<HTMLButtonElement> = async () => {
    try {
      setIsLoading(true);
      const response = await api.post<CreateFriendshipResponse>(
        `/friend/befriend/${id}`,
      );

      //Call parents function to refresh request list
      onRequestUpdate(id);

      //Handle unexpected errors
      if (!response) {
        throw new Error("Failed to accept friendship request");
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to accept friendship");
    }
  };

  const handleReject: React.MouseEventHandler<HTMLButtonElement> = async () => {
    try {
      setIsLoading(true);
      const response = await api.post<{ message: string }>(
        `/friend/deny/${id}`,
      );

      //Call parents function to refresh request list
      onRequestUpdate(id);

      if (!response) {
        throw new Error("Failed to reject friendship request");
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to reject friendship");
    }
  };

  return (
    <article className="flex items-center justify-between rounded-md border border-black/10 bg-white px-4 py-3 shadow-sm">
      <span className="font-medium text-brown">{username}</span>
      <img
        src={avatar}
        alt={`${username}'s avatar`}
        className="h-10 w-10 rounded-full object-cover"
      />
      <div>
        <button onClick={handleAccept} disabled={isLoading}>
          Accept
        </button>
        <button onClick={handleReject} disabled={isLoading}>
          Reject
        </button>
      </div>
    </article>
  );
}
