import { Outlet, NavLink } from "react-router";

export default function Community() {
  return (
    <main>
      <header>
        <nav className="flex justify-center gap-4 py-4 border-2">
          <NavLink
            to="/community"
            end
            className={({ isActive }) =>
              `hover:underline ${isActive ? "font-semibold" : ""}`
            }
          >
            Friends
          </NavLink>
          <NavLink
            to="/community/pending"
            end
            className={({ isActive }) =>
              `hover:underline ${isActive ? "font-semibold" : ""}`
            }
          >
            Pending Requests
          </NavLink>
          <NavLink
            to="/community/unknown"
            end
            className={({ isActive }) =>
              `hover:underline ${isActive ? "font-semibold" : ""}`
            }
          >
            Unknown Users
          </NavLink>
        </nav>
      </header>
      <div>
        <Outlet />
      </div>
    </main>
  );
}
