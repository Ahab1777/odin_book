import { useState } from "react";
import { api } from "../../lib/api";
import { useNavigate } from "react-router";
import type { ApiValidationError } from "../../types/auth";

export default function NewPost() {
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { post } = api;
  const navigate = useNavigate();

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    setFormError(null);
    setFieldErrors({});

    try {
      setIsSubmitting(true);

      await post("/post/create", {
        title,
        content,
      });

      //Return to main page
      navigate("/");
    } catch (err) {
      const error = err as ApiValidationError;

      if (error.status === 400 && Array.isArray(error.data?.errors)) {
        const nextFieldErrors: Record<string, string> = {};
        for (const v of error.data.errors) {
          if (typeof v.path === "string" && typeof v.msg === "string") {
            nextFieldErrors[v.path] = v.msg;
          }
        }
        setFieldErrors(nextFieldErrors);
      } else {
        setFormError(
          error.message || "Something went wrong, please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <section>
        <header>
          <h1>Create a New Post</h1>
        </header>

        {formError && (
          <p className="mb-4 text-sm text-red-600" role="alert">
            {formError}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <label className="flex flex-col">
              <span>Title</span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border p-2 rounded"
                required
              />
              {fieldErrors.title && (
                <span className="text-xs text-red-600">
                  {fieldErrors.title}
                </span>
              )}
            </label>

            <label className="flex flex-col">
              <span>Content</span>
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border p-2 rounded"
                required
              />
              {fieldErrors.content && (
                <span className="text-xs text-red-600">
                  {fieldErrors.content}
                </span>
              )}
            </label>

            <button
              type="submit"
              className="mt-2 p-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating new post..." : "Post it!"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
