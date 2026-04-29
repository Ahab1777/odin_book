import { Link, NavLink, useNavigate } from 'react-router';
import { useState } from 'react';
import { useAuth } from '../auth';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header
      className='
      w-full
      bg-surface
      text-xl
      fixed
      top-0
      left-0
      right-0
      z-50
      shadow-highlight
      font-system
      font-extrabold
      h-24
      '
    >
      <div
        className='
          box-border
          mx-auto
          flex
          items-center
          justify-between
          px-4
          py-5
          gap-6
        '
      >
        {/* Hamburger*/}
        <div className='
        lg:hidden
        flex
        items-center
        '>
          <button
            aria-label='Open navigation menu'
            className='focus:outline-none'
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg width='32' height='32' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M3 6h14M3 10h14M3 14h14'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
              />
            </svg>
          </button>
        </div>
        {/* Nav links - desktop */}
        <nav
          className='
            hidden
            lg:flex
            items-center
            gap-4
            text-base 
          '
          aria-label='Main navigation'
        >
          <NavLink
            to='/'
            end
            className={({ isActive }) =>
              `
              navbar-link       
              ${isActive ? 'navbar-link-active' : 'font-normal'}
            `
            }
          >
            Home
          </NavLink>
          <NavLink
            to='/my-posts'
            className={({ isActive }) =>
              `
              navbar-link       
              ${isActive ? 'navbar-link-active' : 'font-normal'}
            `
            }
          >
            My Posts
          </NavLink>
          {typeof window !== 'undefined' &&
          localStorage.getItem('isDemo') === 'true' ? null : (
            <NavLink
              to='/new-post'
              className={({ isActive }) =>
                `
                navbar-link       
                ${isActive ? 'navbar-link-active' : 'font-normal'}
              `
              }
            >
              New Post
            </NavLink>
          )}
          <NavLink
            to='/community'
            className={({ isActive }) =>
              `
              navbar-link              
              ${isActive ? 'navbar-link-active' : 'font-normal'}
            `
            }
          >
            Community
          </NavLink>
        </nav>
        {/* Nav links - mobile dropdown */}
        {(
          <div
            className={
              `absolute top-24 left-0 w-full bg-surface shadow-lg flex flex-col items-start px-4 py-4 gap-2 lg:hidden z-50 transition-all ease-in-out justify-between ` +
              (menuOpen ? 'h-52' : 'h-0')
            }
          >
            <NavLink
              to='/'
              end
              className={({ isActive }) =>
                `h-10 navbar-link w-full py-2 px-2 rounded ${isActive ? 'navbar-link-active' : 'font-normal'}`
              }
              onClick={() => setMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to='/my-posts'
              className={({ isActive }) =>
                `h-10 navbar-link w-full py-2 px-2 rounded ${isActive ? 'navbar-link-active' : 'font-normal'}`
              }
              onClick={() => setMenuOpen(false)}
            >
              My Posts
            </NavLink>
            {typeof window !== 'undefined' &&
            localStorage.getItem('isDemo') === 'true' ? null : (
              <NavLink
                to='/new-post'
                className={({ isActive }) =>
                  `h-10 navbar-link w-full py-2 px-2 rounded ${isActive ? 'navbar-link-active' : 'font-normal'}`
                }
                onClick={() => setMenuOpen(false)}
              >
                New Post
              </NavLink>
            )}
            <NavLink
              to='/community'
              className={({ isActive }) =>
                `h-10 navbar-link w-full py-2 px-2 rounded ${isActive ? 'navbar-link-active' : 'font-normal'}`
              }
              onClick={() => setMenuOpen(false)}
            >
              Community
            </NavLink>
          </div>
        )}

        <div
          className='
            flex
            items-center
            gap-3
          '
        >
          {isLoading ? null : user ? (
            <>
              <NavLink to={`/profile/${user.id}`}>
                <span
                  className='
                  text-sm
                  font-normal
                  prev-next-btn
                  prev-next-btn-enabled
                  '
                >
                  <b> {currentUser?.username}</b>
                </span>
              </NavLink>
              <button
                type='button'
                onClick={handleLogout}
                className='
                hover:border-accent/50
                  hover:bg-accent/30
                  border
                  border-transparent
                  transition-all
                  font-medium
                  ease-in
                  box-border
                  text-center
                  w-30
                  px-3
                  py-2
                  rounded-2xl
                  hover:border
                  hover:shadow-clickable
                  hover:cursor-pointer
                  active:scale-99
                  active:shadow-sm                   
                '
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to='/login'
                className='
                hover:border-accent/50
                  hover:bg-accent/30
                  border
                  border-transparent
                  transition-all
                  ease-in
                  box-border
                  text-center
                  w-30
                  px-3
                  py-2
                  rounded-2xl
                  hover:border
                  hover:shadow-clickable
                  hover:cursor-pointer
                  active:scale-99
                  active:shadow-sm                   
                '
              >
                Log in
              </Link>
              <Link
                to='/create-account'
                className='
                  px-4
                  py-2
                  rounded-full
                  bg-black
                  text-white
                  hover:bg-black/80
                  active:scale-99
                  active:shadow-sm                   
                '
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
