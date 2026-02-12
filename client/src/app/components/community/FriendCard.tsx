import type { BasicUser } from "../../../types/auth";

export default function FriendCard(user: BasicUser) {
  return (
    <article className="flex items-center justify-between rounded-md border border-black/10 bg-white px-4 py-3 shadow-sm">
      <span className="font-medium text-brown">{user.username}</span>
      <img
        src={user.avatar}
        alt={`${user.username}'s avatar`}
        className="h-10 w-10 rounded-full object-cover"
      />
    </article>
  );
}
