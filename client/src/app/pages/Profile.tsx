import { useState, useEffect } from "react";
import type { UserProfile } from "../../types/community";
import { api } from "../../lib/api";
import { useParams } from "react-router";
import FriendCard from "../components/community/FriendCard";

export default function Profile() {
  const { userId } = useParams();

  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    username: "",
    posts: [],
    friends: [],
    bio: "",
    avatar: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        const res = await api.get<UserProfile>(`/profile/${userId}`);
        if (!cancelled) {
          setProfile(res);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const error = err as Error;
          setError(error.message || "Failed to load posts");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <main>
      <section className="profile-container">
        {isLoading ? (
          <p>Loading profile...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : profile.id === "" ? (
          <p>User not found</p>
        ) : (
          <div className="profile-details">
            <div className="profile-header">
              <img
                src={profile.avatar}
                alt={`${profile.username}'s avatar`}
                className="profile-avatar"
              />
              <h1 className="profile-username">{profile.username}</h1>
            </div>
            <div className="profile-bio">
              <h2>Bio</h2>
              <p>{profile.bio || "No bio available"}</p>
            </div>
            <div className="profile-friends">
              <h2>Friends</h2>
              {profile.friends.length > 0 ? (
                <div>
                  {profile.friends.map((friend) => (
                    <FriendCard key={friend.id} {...friend}></FriendCard>
                  ))}
                </div>
              ) : (
                <p>No friends to display</p>
              )}
            </div>

            {/* Posts */}
            <div className="profile-posts">
              <h2>Posts</h2>
              {profile.posts.length > 0 ? (
                <ul>
                  {profile.posts.map((post) => (
                    <li key={post.id}>
                      <h3>{post.title}</h3>
                      <p>{post.content}</p>
                      <small>
                        Created at: {new Date(post.createdAt).toLocaleString()}
                      </small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No posts to display</p>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
