import { useState } from "react";
import { useNavigate } from "react-router";

export default function CreateAccount() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const navigator = useNavigate();
    
  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    // TODO: implement account creation logic
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <section className="w-full max-w-md rounded-lg border bg-card p-6">
        <header className="mb-4 text-center">
          <h1 className="text-2xl font-semibold">Create account</h1>
          <p className="text-sm text-muted-foreground">
            Sign up to get started
          </p>
        </header>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col">
              <span>Username</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border p-2 rounded"
                required
              />
            </label>

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

            <label className="flex flex-col">
              <span>Confirm password</span>
              <input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="border p-2 rounded"
                required
              />
            </label>

            <button
              type="submit"
              className="mt-2 p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create account
            </button>
          </div>
        </form>
        <hr className="w-40 h-0.5 mx-auto my-4 bg-black border-0 rounded-sm md:my-6" />
        <button
          data-slot="button"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background text-foreground hover:bg-lime hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 h-9 px-4 py-2 has-[&>svg]:px-3 w-full gap-2"
          type="button"
          onClick={() => navigator("/")}
        >
          Back to login
        </button>
      </section>
    </main>
  );
}
