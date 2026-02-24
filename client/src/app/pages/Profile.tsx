import { useState, useEffect } from "react";
import type { UserProfile } from "../../types/community";

export default function Profile(userId: string) {
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
            const 
    

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
  }, []);

  return <></>;
}
