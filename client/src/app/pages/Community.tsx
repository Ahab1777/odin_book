import { Outlet, NavLink } from "react-router";

export default function Community() {
  return (
    <main
      className="
    min-h-screen
    mx-auto
    justify-center
    items-center
      "
    >
      <header>
        <nav className="
        flex
        justify-center
        gap-4
        py-8
        min-h-32
        ">
          <NavLink
            to="/community"
            end
            className={({ isActive }) =>
              `navbar-link ${isActive ? "navbar-link-active" : "font-normal"}`
            }
          >
            Friends
          </NavLink>
          <NavLink
            to="/community/pending"
            end
            className={({ isActive }) =>
              `navbar-link ${isActive ? "navbar-link-active" : "font-normal"}`
            }

          >
            Pending Requests
          </NavLink>
          <NavLink
            to="/community/unknown"
            end
            className={({ isActive }) =>
              `navbar-link ${isActive ? "navbar-link-active" : "font-normal"}`
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
