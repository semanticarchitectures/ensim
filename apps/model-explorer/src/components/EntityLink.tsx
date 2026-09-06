import { Link } from "react-router-dom";
import { organizationsById, rolesById, c2NodesById, doctrineProcessesById, missionsById } from "../data";

type Kind = "organization" | "role" | "c2node" | "process" | "mission";

const routeBase: Record<Kind, string> = {
  organization: "/organizations",
  role: "/roles",
  c2node: "/c2-nodes",
  process: "/doctrine-processes",
  mission: "/missions",
};

function resolveName(kind: Kind, id: string): string | undefined {
  switch (kind) {
    case "organization":
      return organizationsById.get(id)?.name;
    case "role":
      return rolesById.get(id)?.name;
    case "c2node":
      return c2NodesById.get(id)?.name;
    case "process":
      return doctrineProcessesById.get(id)?.name;
    case "mission":
      return missionsById.get(id)?.name;
  }
}

/** Links to another record by id, resolving its display name. Renders an
 * explicit "unresolved reference" marker instead of silently hiding a dangling
 * id — a broken reference is exactly the kind of thing this app exists to surface. */
export function EntityLink({ kind, id }: { kind: Kind; id: string | null | undefined }) {
  if (!id) return <span className="muted">—</span>;
  const name = resolveName(kind, id);
  if (!name) {
    return (
      <span className="unresolved" title={`No ${kind} record with id "${id}"`}>
        {id} (unresolved)
      </span>
    );
  }
  return <Link to={`${routeBase[kind]}/${id}`}>{name}</Link>;
}
