import { useState } from 'react';
import { useNavigate } from 'react-router';
import { api } from '../../lib/api';
import { useAuth } from '../auth';
import type { ApiValidationError, SignupResponse } from '../../types/auth';

export default function CreateAccount() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const navigate = useNavigate();
  const { post } = api;
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setUser } = useAuth();

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();

    setFormError(null);
    setFieldErrors({});

    if (password !== passwordConfirmation) {
      setFieldErrors((prev) => ({
        ...prev,
        passwordConfirmation: 'Password does not match',
      }));
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await post<SignupResponse>('/auth/signup', {
        username,
        email,
        password,
      });

      //Store token in local storage and user in context
      localStorage.setItem('jwtToken', res.token);
      setUser({
        id: res.userId,
        username: res.username,
        email,
        avatar: res.avatar,
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
    <main className='flex min-h-screen items-center justify-center'>
      <section className='
      w-full
      max-w-md
      rounded-lg
      border
      p-6
      bg-surface
      animate-color-cycle-background
      '>
        <header className='mb-4 text-center'>
          <h1 className='
          text-2xl
          text-text
          font-semibold
          '>Create account</h1>
          <p className='
          text-sm
          text-text
          '>
            Sign up to get started
          </p>
        </header>

        {formError && (
          <p className='mb-4 text-sm text-red-600' role='alert'>
            {formError}
          </p>
        )}

        <form
          className='
            space-y-4
          '
          onSubmit={handleSubmit}
        >
          <div
            className='
              flex
              flex-col
              gap-4
            '
          >
            <label
              className='
                flex
                flex-col
              '
            >
              <span
                className='
                  text-text
                '
              >
                Username
              </span>
              <input
                type='text'
                value={username}
                maxLength={12}
                onChange={(e) => setUsername(e.target.value)}
                className='
                  bg-background
                  rounded
                  border
                  p-2
                  hover:border-primary
                  hover:shadow-md
                  transition-all
                '
                required
              />
              {fieldErrors.username && (
                <span
                  className='
                    text-xs
                    text-red-600
                  '
                >
                  {fieldErrors.username}
                </span>
              )}
            </label>

            <label
              className='
                flex
                flex-col
              '
            >
              <span
                className='
                  text-text
                '
              >
                Email
              </span>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='
                
                  bg-background
                  rounded
                  border
                  p-2
                  hover:border-primary
                  hover:shadow-md
                  transition-all
                '
                required
              />
              {fieldErrors.email && (
                <span
                  className='
                    text-xs
                    text-red-600
                  '
                >
                  {fieldErrors.email}
                </span>
              )}
            </label>

            <label
              className='
                flex
                flex-col
              '
            >
              <span
                className='
                  text-text
                '
              >
                Password
              </span>
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='
                  bg-background
                  rounded
                  border
                  p-2
                  hover:border-primary
                  hover:shadow-md
                  transition-all
                '
                required
              />
              {fieldErrors.password && (
                <span
                  className='
                    text-xs
                    text-red-600
                  '
                >
                  {fieldErrors.password}
                </span>
              )}
            </label>

            <label
              className='
                flex
                flex-col
              '
            >
              <span
                className='
                  text-text
                '
              >
                Confirm password
              </span>
              <input
                type='password'
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className='
                  bg-background
                  rounded
                  border
                  p-2
                  hover:border-primary
                  hover:shadow-md
                  transition-all
                '
                required
              />
              {fieldErrors.passwordConfirmation && (
                <span
                  className='
                    text-xs
                    text-red-600
                  '
                >
                  {fieldErrors.passwordConfirmation}
                </span>
              )}
            </label>

            <button
              type='submit'
              className="
                text-text
                focus-visible:border-ring
                focus-visible:ring-ring/50
                aria-invalid:ring-destructive/20
                dark:aria-invalid:ring-destructive/40
                aria-invalid:border-destructive
                bg-background
                text-foreground
                hover:bg-primary
                hover:text-accent-foreground
                hover:text-surface
                hover:shadow-md
                dark:bg-input/30
                dark:border-input
                dark:hover:bg-input/50
                mt-5
                inline-flex
                h-9
                w-full
                shrink-0
                items-center
                justify-center
                gap-2
                rounded-md
                border
                px-4
                py-2
                text-sm
                font-medium
                whitespace-nowrap
                transition-all
                duration-700
                ease-out
                outline-none
                focus-visible:ring-[3px]
                disabled:pointer-events-none
                disabled:opacity-50
                has-[&>svg]:px-3
                [&_svg]:pointer-events-none
                [&_svg]:shrink-0
                [&_svg:not([class*='size-'])]:size-4
              "
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>

        <hr
          className='
            w-40
            h-0.5
            mx-auto
            my-4
            bg-black
            border-0
            rounded-sm
            md:my-6
          '
        />

        <button
          data-slot='button'
          className="
            text-text
            focus-visible:border-ring
            focus-visible:ring-ring/50
            aria-invalid:ring-destructive/20
            dark:aria-invalid:ring-destructive/40
            aria-invalid:border-destructive
            bg-background
            text-foreground
            hover:bg-accent
            hover:text-accent-foreground
            hover:text-text
            hover:shadow-md
            dark:bg-input/30
            dark:border-input
            dark:hover:bg-input/50
            mt-5
            inline-flex
            h-9
            w-full
            shrink-0
            items-center
            justify-center
            gap-2
            rounded-md
            border
            px-4
            py-2
            text-sm
            font-medium
            whitespace-nowrap
            transition-all
            duration-700
            ease-out            
            outline-none
            focus-visible:ring-[3px]
            disabled:pointer-events-none
            disabled:opacity-50
            has-[&>svg]:px-3
            [&_svg]:pointer-events-none
            [&_svg]:shrink-0
            [&_svg:not([class*='size-'])]:size-4
          "
          type='button'
          onClick={() => navigate('/')}
        >
          Back to login
        </button>
      </section>
    </main>
  );
}
