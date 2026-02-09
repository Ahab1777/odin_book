import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { AuthContext, type User } from "./auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      setIsLoading(false);
      return;
    }

    api
      .get<User>("/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((u) => {
        setUser(u);
      })
      .catch((err: any) => {
        if (err.status === 401 || err.status === 403) {
          localStorage.removeItem("jwtToken");
        }
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  function logout() {
    localStorage.removeItem('jwtToken');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

