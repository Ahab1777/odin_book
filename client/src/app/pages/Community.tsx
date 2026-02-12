import { Outlet, NavLink } from "react-router";

export default function Community() {

  return (
    <main>
      <header>
        <nav>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `hover:underline ${isActive ? "font-semibold" : ""}`
            }
          >
            Friends
          </NavLink>
          <NavLink
            to="/pending"
            end
            className={({ isActive }) =>
              `hover:underline ${isActive ? "font-semibold" : ""}`
            }
          >
            Pending Requests
          </NavLink>
          <NavLink
            to="/unknown"
            end
            className={({ isActive }) =>
              `hover:underline ${isActive ? "font-semibold" : ""}`
            }
          >
            Unknown Users
          </NavLink>
        </nav>
      </header>
      <Outlet />
    </main>
  );
}
