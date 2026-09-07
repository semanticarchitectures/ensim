import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/organizations", label: "Organizations" },
  { to: "/roles", label: "Roles" },
  { to: "/c2-nodes", label: "C2 Nodes" },
  { to: "/doctrine-processes", label: "Doctrine Processes" },
  { to: "/systems", label: "Systems" },
  { to: "/interactions", label: "Interactions" },
  { to: "/decisions", label: "Decisions" },
  { to: "/missions", label: "Missions" },
];

export function Layout() {
  return (
    <div className="app-shell">
      <nav className="app-nav">
        <NavLink to="/" end className="brand">
          ENSIM
        </NavLink>
        <ul>
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className={({ isActive }) => (isActive ? "active" : undefined)}>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
