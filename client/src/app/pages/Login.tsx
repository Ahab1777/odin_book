import { useState } from "react";
import { useLoaderData, useNavigate } from "react-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { from } = useLoaderData() as { from: string };
  const navigate = useNavigate();

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    //TODO - implement login logic

    navigate(from, { replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <section className="w-full max-w-md rounded-lg border bg-card p-6">
        <header className="mb-4 text-center">
          <h1 className="text-2xl font-semibold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account
          </p>
        </header>

        <form className="space-y-4">
          <div className="flex flex-col gap-4 ">
            <label className="flex flex-col">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 rounded"
                required
              />
            </label>

            <label className="flex flex-col">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded"
                required
              />
            </label>

            <button
              type="submit"
              className="mt-2 p-2 bg-blue-600 text-white rounded"
              onSubmit={handleSubmit}
            >
              Log in
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
