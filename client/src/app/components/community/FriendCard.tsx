import type { BasicUser } from "../../../types/auth";
import { Link } from "react-router";

export default function FriendCard(user: BasicUser) {
  return (
<Link to={`/profile/${user.id}`}>
    <article className="flex items-center justify-between rounded-md border border-black/10 bg-white px-4 py-3 shadow-sm">
      <span className="font-medium text-brown">{user.username}</span>
      <img
        src={user.avatar}
        alt={`${user.username}'s avatar`}
        className="h-10 w-10 rounded-full object-cover"
      />
    </article>
</Link>


  );
}
