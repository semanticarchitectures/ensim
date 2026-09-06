import { Link } from "react-router-dom";
import { organizations, roles, c2Nodes, doctrineProcesses, missions } from "../data";

const counts = [
  { label: "Organizations", to: "/organizations", count: organizations.length },
  { label: "Roles", to: "/roles", count: roles.length },
  { label: "C2 Nodes", to: "/c2-nodes", count: c2Nodes.length },
  { label: "Doctrine Processes", to: "/doctrine-processes", count: doctrineProcesses.length },
  { label: "Missions", to: "/missions", count: missions.length },
];

export function HomePage() {
  return (
    <>
      <h1>ENSIM Model Explorer</h1>
      <p>
        A read-only browser over the <code>org-doctrine-model</code> seed dataset — organizations, roles, C2 nodes,
        doctrine processes, and mission scenarios, each grounded in a cited public doctrine source. See{" "}
        <code>AGENTS.md</code> for the citation discipline this app makes visible.
      </p>
      <ul className="home-counts">
        {counts.map((c) => (
          <li key={c.to}>
            <Link to={c.to}>
              <span className="count">{c.count}</span> {c.label}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
