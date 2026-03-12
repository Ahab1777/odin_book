import { useState, useEffect } from "react";
import type { FriendsResponse, UserProfile } from "../../types/community";
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
  const [friends, setFriends] = useState<FriendsResponse | null>(null);
  //Friends pagination state
  const [friendsPage, setFriendsPage] = useState<number>(1)

  //Friends useEffect
  useEffect(() => {
    let cancelled = false;

    async function loadFriends() {
      try {
        const res = await api.get<FriendsResponse>(`/friend/friendships/${userId}?page${friendsPage}`);
        if (!cancelled) {
          setFriends(res);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const error = err as Error;
          setError(error.message || "Failed to fetch friends");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadFriends();
    return () => {
      cancelled = true;
    };
  }, [friendsPage, userId]);

  //Profile userEffect
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
    <main className="flex flex-col items-center bg-slate-100 min-h-screen py-8">
      <section className="profile-container w-full max-w-4xl bg-white shadow-md rounded-lg p-6">
        {isLoading ? (
          <p className="text-indigo text-center">Loading profile...</p>
        ) : error ? (
          <p className="text-red-600 text-center">{error}</p>
        ) : profile.id === "" ? (
          <p className="text-brown text-center">User not found</p>
        ) : (
          <div className="profile-details flex flex-col items-center gap-6">
            <div className="profile-header flex flex-col items-center">
              <img
                src={profile.avatar}
                alt={`${profile.username}'s avatar`}
                className="profile-avatar w-32 h-32 rounded-full border-4 border-indigo"
              />
              <h1 className="profile-username text-2xl font-bold text-indigo mt-4">
                {profile.username}
              </h1>
            </div>
            <div className="profile-bio w-full text-center">
              <h2 className="text-xl font-semibold text-brown">Bio</h2>
              <p className="text-slate mt-2">
                {profile.bio || "No bio available"}
              </p>
            </div>
            <div className="profile-friends w-full text-center">
              <h2 className="text-xl font-semibold text-brown">Friends</h2>
              {friends.friends.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  {profile.friends.map((friend) => (
                    <FriendCard key={friend.id} {...friend}></FriendCard>
                  ))}
                </div>
              ) : (
                <p className="text-slate mt-2">No friends to display</p>
              )}
            </div>
            <div className="profile-posts w-full text-center">
              <h2 className="text-xl font-semibold text-brown">Posts</h2>
              {profile.posts.length > 0 ? (
                <ul className="space-y-4 mt-4">
                  {profile.posts.map((post) => (
                    <li
                      key={post.id}
                      className="bg-rose-100 p-4 rounded-lg shadow-md"
                    >
                      <h3 className="text-lg font-bold text-indigo">
                        {post.title}
                      </h3>
                      <p className="text-slate mt-2">{post.content}</p>
                      <small className="text-slate mt-2 block">
                        Created at: {new Date(post.createdAt).toLocaleString()}
                      </small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate mt-2">No posts to display</p>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
