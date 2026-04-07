import { useState } from 'react';
import { useLoaderData, useNavigate } from 'react-router';
import { api } from '../../lib/api';
import { useAuth } from '../auth';
import type { ApiValidationError, LoginResponse } from '../../types/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const { from } = useLoaderData() as { from: string };
  const navigate = useNavigate();

  const { post } = api;
  const { setUser } = useAuth();

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      //Login user through API
      const res = await post<LoginResponse>('/auth/login', {
        email,
        password,
      });

      //Save jwtToken
      localStorage.setItem('jwtToken', res.token);
      // Clear demo flag for regular login
      localStorage.removeItem('isDemo');
      setUser({
        id: res.userId,
        username: res.username,
        email: res.email,
        avatar: res.avatar,
      });
      //Go back to original page
      navigate(from, { replace: true });
    } catch (error) {
      const err = error as ApiValidationError;

      if (err.status === 400) {
        const serverMsg =
          typeof err.data?.errors === 'string'
            ? err.data.errors
            : 'Invalid request. Please check your input.';
        setLoginError(serverMsg);
      } else if (err.status === 401) {
        setLoginError('Invalid email or password.');
      } else if (!err.status) {
        setLoginError('Network error. Please try again.');
      } else {
        setLoginError(`Unexpected error (status ${err.status}).`);
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDemo() {
    setIsLoading(true);
    setLoginError('');

    try {
      const res = await post<LoginResponse>('/auth/demo-login', {});

      localStorage.setItem('jwtToken', res.token);
      // Mark demo session
      localStorage.setItem('isDemo', 'true');
      setUser({
        id: res.userId,
        username: res.username,
        email: res.email,
        avatar: res.avatar,
      });

      navigate(from, { replace: true });
    } catch (error) {
      const err = error as ApiValidationError;
      if (!err.status) {
        setLoginError('Network error. Please try again.');
      } else {
        setLoginError(`Unable to start demo (status ${err.status}).`);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div
      className='
      bg-background
    '
    >
      <main
        className='
        flex
        min-h-screen
        items-center
        justify-center
      '
      >
        <section
          className='
          bg-surface
          bg-card
          w-full
          max-w-md
          rounded-lg
          border
          p-6
          animate-color-cycle-background
        '
        >
          <header
            className='
            mb-4
            text-center
          '
          >
            <h1
              className='
              text-2xl
              font-semibold
            '
            >
              Welcome back
            </h1>
            <p
              className='
              text-muted-foreground
              text-sm
            '
            >
              Sign in to your account
            </p>
          </header>

          <form
            className='
            space-y-4
          '
            onSubmit={handleSubmit}
          >
            {loginError ? <div>{loginError}</div> : ''}
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
                    '
                  required
                />
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
              </label>

              <button
                type='submit'
                className='
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
                  outline-none
                  focus-visible:ring-[3px]
                  disabled:pointer-events-none
                  disabled:opacity-50
                  has-[&>svg]:px-3
                  [&_svg]:pointer-events-none
                  [&_svg]:shrink-0
                  [&_svg:not([class*="size-"])]:size-4
                '
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Log in'}
              </button>
            </div>
          </form>
          <button
            data-slot='button'
            className='
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
              outline-none
              focus-visible:ring-[3px]
              disabled:pointer-events-none
              disabled:opacity-50
              has-[&>svg]:px-3
              [&_svg]:pointer-events-none
              [&_svg]:shrink-0
              [&_svg:not([class*="size-"])]:size-4
            '
            type='button'
            onClick={() => navigate('/create-account')}
          >
            ...or create an account
          </button>
          <hr
            className='
            mx-auto
            my-4
            h-0.5
            w-40
            rounded-sm
            border-0
            bg-black
            md:my-10
          '
          />
          <button
            data-slot='button'
            className='
              [&amp;_svg]:pointer-events-none
              [&amp;_svg:not([class*="size-"])]:size-4
              [&amp;_svg]:shrink-0
              focus-visible:border-ring
              focus-visible:ring-ring/50
              aria-invalid:ring-destructive/20
              dark:aria-invalid:ring-destructive/40
              aria-invalid:border-destructive
              bg-background
              text-foreground
              hover:bg-accent
              hover:text-accent-foreground
              hover:shadow-md
              dark:bg-input/30
              dark:border-input
              dark:hover:bg-input/50
              has-[&gt;svg]:px-3
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
              outline-none
              focus-visible:ring-[3px]
              disabled:pointer-events-none
              disabled:opacity-50
            '
            type='button'
            onClick={handleDemo}
            disabled={isLoading}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              stroke-width='2'
              stroke-linecap='round'
              stroke-linejoin='round'
              className='
                lucide
                lucide-eye
                h-4
                w-4
              '
            >
              <path d='M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0'></path>
              <circle cx='12' cy='12' r='3'></circle>
            </svg>
            {isLoading ? 'Starting demo...' : 'Continue as Demo User'}
          </button>
        </section>
      </main>
    </div>
  );
}
