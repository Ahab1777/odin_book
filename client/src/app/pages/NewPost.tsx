import { useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../../lib/api';
import type { ApiValidationError } from '../../types/auth';

export default function NewPost() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { post } = api;

  const isDemo =
    typeof window !== 'undefined' && localStorage.getItem('isDemo') === 'true';

  if (isDemo) {
    return (
      <main>
        <section>
          <header>
            <h1>Demo Account</h1>
          </header>
          <p className='mb-4'>Demo accounts cannot create new posts.</p>
          <button
            onClick={() => navigate(-1)}
            className='px-4 py-2 rounded bg-blue-600 text-white'
          >
            Go back
          </button>
        </section>
      </main>
    );
  }

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    setFormError(null);
    setFieldErrors({});

    try {
      setIsSubmitting(true);

      await post('/post/create', {
        title,
        content,
      });

      //Return to main page
      navigate('/');
    } catch (err) {
      const error = err as ApiValidationError;

      if (error.status === 400 && Array.isArray(error.data?.errors)) {
        const nextFieldErrors: Record<string, string> = {};
        for (const v of error.data.errors) {
          if (typeof v.path === 'string' && typeof v.msg === 'string') {
            nextFieldErrors[v.path] = v.msg;
          }
        }
        setFieldErrors(nextFieldErrors);
      } else {
        setFormError(
          error.message || 'Something went wrong, please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      className='
    font-funnel
    flex
    justify-center
    min-h-screen
    items-stretch
      '
    >
      <section
        className='
        flex-1
        max-w-180
        px-4
        '
      >
        <header>
          <h1
            className='
        text-text
        text-3xl
        text-center
        m-5
        '
          >
            Create a New Post
          </h1>
        </header>

        {formError && (
          <p className='mb-4 text-sm text-red-600' role='alert'>
            {formError}
          </p>
        )}

        <form
          className='
        bg-surface
        border
        border-accent/30
        rounded-2xl
        shadow-2xs
        p-4
        mx-auto
        w-full
        font-funnel          
          '
          onSubmit={handleSubmit}
        >
          <div className='flex flex-col gap-4'>
            <label className='
            grid
            grid-rows-[auto_1fr]
            grid-cols-[auto_1fr]
            '>
              <span
                className='
              col-start-1

                '
              >Title</span>
              <span
                className='
              text-sm
              text-muted-text
              col-start-2
              ml-auto
                '
              >
                Characters: {title.length}
              </span>
              <input
                placeholder='Short title — 3–24 chars'
                maxLength={24}
                minLength={3}
                type='text'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className='
                border 
                p-2 
                rounded
                bg-background
                col-start-1
                col-end-3
                '
                required
              />
              {fieldErrors.title && (
                <span className='text-xs text-red-600'>
                  {fieldErrors.title}
                </span>
              )}
            </label>

            <label className='
            grid
            grid-cols-[auto_1fr]
            grid-rows-[auto_1fr]
            '>
              <span
                className='
              col-start-1
                '
              >Content</span>
              <span
                className='
              text-sm
              text-muted-text
              col-start-2
              ml-auto
                '
              >
                Characters: {content.length}
              </span>
              <textarea
                placeholder='Write your post — 10–240 chars'
                maxLength={240}
                minLength={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className='
                border 
                p-2 
                rounded
                bg-background
                h-25
                col-start-1
                col-end-3
                '
                required
              />
              {fieldErrors.content && (
                <span className='text-xs text-red-600'>
                  {fieldErrors.content}
                </span>
              )}
            </label>

            <button
              type='submit'
              className='
              hover:cursor-pointer 
              hover:border-accent/50 
              hover:bg-accent/20
              hover:border 
              hover:shadow-clickable 
              active:scale-95 
              active:shadow-sm
              active:bg-accent 
              border 
              transition-all 
              ease-in 
              box-border 
              text-center 
              w-30 
              px-3 
              py-1 
              rounded-2xl 
              border-accent/50 
              shadow-clickable
              mx-auto
              '
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating new post...' : 'Post it!'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
