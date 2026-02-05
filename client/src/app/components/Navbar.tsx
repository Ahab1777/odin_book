import { Link, NavLink } from "react-router";

export default function Navbar() {
  return (
    <header className="navbar bg-lime text-xl">
      <div className="navbar__inner">
        <div className="navbar__brand">
          <Link to="/" className="navbar__logo">
            {/* Replace with your logo or text */}
            <span className="navbar__logo-mark">OB</span>
            <span className="navbar__logo-text">OdinBook</span>
          </Link>
        </div>

        <nav className="navbar__nav" aria-label="Main navigation">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `navbar__link ${isActive ? "navbar__link--active" : ""}`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/feed"
            className={({ isActive }) =>
              `navbar__link ${isActive ? "navbar__link--active" : ""}`
            }
          >
            Feed
          </NavLink>
          <NavLink
            to="/friends"
            className={({ isActive }) =>
              `navbar__link ${isActive ? "navbar__link--active" : ""}`
            }
          >
            Friends
          </NavLink>
        </nav>

        <div className="navbar__actions">
          <Link to="/login" className="navbar__button navbar__button--ghost">
            Log in
          </Link>
          <Link to="/signup" className="navbar__button navbar__button--primary">
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
