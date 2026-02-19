import { useState } from "react";
import type { BasicUser } from "../../../types/auth";

export default function PendingCard({id, username, avatar}: BasicUser) {
  const [rejectError, setRejectError] = useState("");
  const [acceptError, setAcceptError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const handleAccept: React.MouseEventHandler<HTMLButtonElement> = async () => {

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
