import { Link, NavLink } from "react-router";

export default function Navbar() {
  return (
    <header className="w-full bg-lime text-xl sticky top-0 z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-5 py-5 gap-6">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            {/* Replace with your logo or text */}
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
            to="/feed"
            className={({ isActive }) =>
              `hover:underline ${isActive ? "font-semibold" : ""}`
            }
          >
            Feed
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
          <Link
            to="/login"
            className="px-4 py-2 rounded-full border border-black/20 hover:bg-black/5"
          >
            Log in
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-full bg-black text-white hover:bg-black/80"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
