import type { PostCardContent } from "../../types/auth";
import PostCard from "../components/PostCard";


export default function Home() {
  //Api postIndex return object example:
  // {
  //   "posts": [
  // {
  //   "id": "post_123",
  //   "title": "My first post",
  //   "content": "This is the content of my first post.",
  //   "userId": "user_abc",
  //   "createdAt": "2026-02-10T12:34:56.789Z",
  //   "updatedAt": "2026-02-10T12:34:56.789Z",
  //   "user": {
  // "id": "user_abc",
  // "username": "alice",
  // "avatar": "https://www.gravatar.com/avatar/abc123..."
  //   }
  // }
  //   ]
    // }
    
    const postIndex:
        PostCardContent[] = [];
    //TODO - fetch postIndex
    




  return (
    <main>
      <section>
          <h1 className="text-brown text-center">Home Feed</h1>
              {postIndex.map(post => (
            <PostCard key={post.id} {...post}/>
        ))}
          </section>
    </main>
  );
}
