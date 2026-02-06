import type { LoaderFunctionArgs } from "react-router";

export async function loginLoader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const from = url.searchParams.get("from") || "/";
  const safeFrom = from.startsWith("/") ? from : "/";
  return { from: safeFrom };
}