import { useState, useEffect } from "react";
import type { UserProfile } from "../../types/community";
import { api } from "../../lib/api";
import { useParams } from "react-router";
import FriendsContainer from "../components/profile/FriendsContainer";
import PostsContainer from "../components/profile/PostsContainer";
import { useAuth } from "../auth";

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

  //Bio editing
  const { user: currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [draftBio, setDraftBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  function startEdit() {
    setDraftBio(profile.bio ?? "");
    setSaveError(null);
    setIsEditing(true);
  }
  function cancelEdit() {
    setIsEditing(false);
    setSaveError(null);
  }

  async function saveBio() {
    if (draftBio.length > 250) {
      setSaveError("Bio must be 250 characters or less");
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      await api.put("/bio", { bio: draftBio });
      setProfile((p) => ({ ...p, bio: draftBio }));
      setIsEditing(false);
    } catch (err: unknown) {
      const e = err as Error;
      setSaveError(e.message || "Failed to save bio");
    } finally {
      setIsSaving(false);
    }
  }

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

              {!isEditing ? (
                <>
                  <p className="text-slate mt-2">
                    {profile.bio || "No bio available"}
                  </p>

                  {typeof window !== "undefined" &&
                  localStorage.getItem("isDemo") === "true"
                    ? ""
                    : currentUser?.id === profile.id && (
                        <button
                          onClick={startEdit}
                          className="mt-2 btn btn-secondary"
                        >
                          Edit
                        </button>
                      )}
                </>
              ) : (
                <>
                  <textarea
                    value={draftBio}
                    onChange={(e) => setDraftBio(e.target.value)}
                    maxLength={250}
                    rows={4}
                    disabled={isSaving}
                    className="w-full mt-2 p-2 border rounded"
                  />
                  {saveError && (
                    <p className="text-red-600 mt-2">{saveError}</p>
                  )}
                  <div className="flex gap-2 justify-center mt-2">
                    <button
                      onClick={saveBio}
                      disabled={isSaving}
                      className="btn btn-primary"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={isSaving}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="profile-friends w-full text-center">
              {userId ? (
                <FriendsContainer userId={userId} />
              ) : (
                <p className="text-red-600">
                  Unable to load friends: User ID is missing.
                </p>
              )}
            </div>
            <div className="profile-posts w-full text-center">
              <h2 className="text-xl font-semibold text-brown">Posts</h2>
              {userId ? (
                <PostsContainer userId={userId as string} />
              ) : (
                <p className="text-red-600">
                  Unable to load posts: User ID is missing.
                </p>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
