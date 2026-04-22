import { Link, NavLink, useNavigate } from 'react-router';
import { useAuth } from '../auth';

export default function Navbar() {
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
      sticky
      top-0
      z-50
      shadow-highlight
      font-system
      font-extrabold
      '
    >
      <div
        className='
          box-border
          mx-auto
          flex
          items-center
          justify-between
          px-8
          py-5
          gap-6

        '
      >
        <div
          className='
            flex
            items-center
            gap-2
            
          '
        >
          <Link
            to='/'
            className='
              flex
              items-center
              gap-2
              
            '
          >
            <span
              className='
                font-semibold
              '
            >
              OB
            </span>
            <span
              className='
                font-medium
              '
            >
              OdinBook
            </span>
          </Link>
        </div>

        <nav
          className='
            flex
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
            hover:border-accent/50
              hover:bg-accent/20
              transition-all
              ease-in
              box-border
              text-center
              w-30
              px-3
              py-1
              rounded-2xl
              hover:border
              hover:shadow-clickable
              hover: border-accent/50
              ${isActive ?
                'border-accent/50 bg-accent/60 border shadow-clickable font-bold' : 'font-normal'}
            `
            }
          >
            Home
          </NavLink>
          <NavLink
            to='/my-posts'
            className={({ isActive }) =>
              `
            hover:border-accent/50
              hover:bg-accent/20
              transition-all
              ease-in
              box-border
              text-center
              w-30
              px-3
              py-1
              rounded-2xl
              hover:border
              hover:shadow-clickable
              hover: border-accent/50
              ${isActive ?
                'border-accent/50 bg-accent/60 border shadow-clickable font-bold' : 'font-normal'}
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
            hover:border-accent/50
              hover:bg-accent/20
              transition-all
              ease-in
              box-border
              text-center
              w-30
              px-3
              py-1
              rounded-2xl
              hover:border
              hover:shadow-clickable
              hover: border-accent/50
              ${isActive ?
                'border-accent/50 bg-accent/60 border shadow-clickable font-bold' : 'font-normal'}
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
            hover:border-accent/50
              hover:bg-accent/20
              transition-all
              ease-in
              box-border
              text-center
              w-30
              px-3
              py-1
              rounded-2xl
              hover:border
              hover:shadow-clickable
              hover: border-accent/50
              ${isActive ?
                'border-accent/50 bg-accent/60 border shadow-clickable font-bold' : 'font-normal'}
            `
            }
          >
            Community
          </NavLink>
        </nav>

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
                  hover:underline
                  
                  '
                  >
                  Hi, {currentUser?.username}
                </span>
              </NavLink>
              <button
                type='button'
                onClick={handleLogout}
                className='
                hover:border-accent/50
                  hover:bg-accent/20
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
                  px-4
                  py-2
                  rounded-full
                  border
                  border-black/20
                  hover:bg-black/5
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
