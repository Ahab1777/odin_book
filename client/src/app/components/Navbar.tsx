import { Link, NavLink, useNavigate } from "react-router";
import { useAuth } from "../auth";

export default function Navbar() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="w-full bg-lime text-xl sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-5 py-5 gap-6">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-semibold">OB</span>
            <span className="font-medium">OdinBook</span>
          </Link>
        </div>

        <nav className="flex items-center gap-4" aria-label="Main navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `hover:underline ${isActive ? "font-semibold" : ""}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/my-posts"
            className={({ isActive }) =>
              `hover:underline ${isActive ? "font-semibold" : ""}`
            }
          >
            My Posts
          </NavLink>
          <NavLink
            to="/friends"
            className={({ isActive }) =>
              `hover:underline ${isActive ? "font-semibold" : ""}`
            }
          >
            Friends
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          {isLoading ? null : user ? (
            <>
              <span className="text-sm">Hi, {user.username}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-full border border-black/20 hover:bg-black/5"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-full border border-black/20 hover:bg-black/5"
              >
                Log in
              </Link>
              <Link
                to="/create-account"
                className="px-4 py-2 rounded-full bg-black text-white hover:bg-black/80"
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
