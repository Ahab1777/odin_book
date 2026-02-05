import { redirect, type LoaderFunctionArgs } from "react-router";
import { api } from "../../lib/api";

type User = {
  id: string;
  username: string;
  email: string;
  // add more fields if your /auth/me returns them
};

export async function requireUser({ request }: LoaderFunctionArgs) {
  const jwtToken = localStorage.getItem("jwtToken");

  if (!jwtToken) {
    const url = new URL(request.url);
    const from = url.pathname + url.search;
    throw redirect(`/login?from=${encodeURIComponent(from)}`);
  }

  try {
    const user = await api.get<User>("/auth/me", {
      headers: { Authorization: `Bearer ${jwtToken}` },
    });
    return { user };
  } catch (err) {
    const error = err as { status?: number };

    if (error.status === 401 || error.status === 403) {
      const url = new URL(request.url);
      const from = url.pathname + url.search;
      throw redirect(`/login?from=${encodeURIComponent(from)}`);
    }

    throw new Response("Failed to load user", { status: 500 });
  }
}