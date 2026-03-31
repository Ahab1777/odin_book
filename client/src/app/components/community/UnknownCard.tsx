import { useState } from "react";
import type { BasicUser } from "../../../types/auth";
import { api } from "../../../lib/api";
import type { FriendRequestResponse } from "../../../types/community";

interface UnknownCardProps extends BasicUser {
  onRequestUpdate: (id: string) => void; // Callback prop
}

export default function UnknownCard({
  id,
  username,
  avatar,
  onRequestUpdate,
}: UnknownCardProps) {
  const [error, setError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const isDemo =
    typeof window !== "undefined" && localStorage.getItem("isDemo") === "true";

  const handleSendFriendRequest: React.MouseEventHandler<
    HTMLButtonElement
  > = async () => {
    try {
      setIsLoading(true);
      const response = await api.post<FriendRequestResponse>(
        `/friend/request/${id}`,
      );

      //Call parent's function to refresh request list
      onRequestUpdate(id);

      //Handle unexpected errors
      if (!response) {
        throw new Error("Failed to make friendship request");
      }
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to request friendship");
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
        {error ? (
          <p>`${error}`</p>
        ) : (
          <>
            {isDemo ? (
              <button disabled className="opacity-50">
                Disabled for demo users
              </button>
            ) : (
              <button
                onClick={handleSendFriendRequest}
                disabled={isLoading}
                className="hover:font-bold"
              >
                Befriend
              </button>
            )}
          </>
        )}
      </div>
    </article>
  );
}
