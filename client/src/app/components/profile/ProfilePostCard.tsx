import type { UserPostCardContent } from "../../../types/content";

export default function ProfilePostCard(post: UserPostCardContent) {
  return (
    <>
      <li key={post.id} className="bg-rose-100 p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-bold text-indigo">{post.title}</h3>
        <p className="text-slate mt-2">{post.content}</p>
        <small className="text-slate mt-2 block">
          Created at: {new Date(post.createdAt).toLocaleString()}
        </small>
      </li>
    </>
  );
}
