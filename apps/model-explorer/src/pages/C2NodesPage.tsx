import { Link, useParams } from "react-router-dom";
import { c2Nodes, c2NodesById, rolesInC2Node } from "../data";
import { RecordTable } from "../components/RecordTable";
import { DoctrineSourceList } from "../components/DoctrineSourceList";
import { EntityLink } from "../components/EntityLink";
import { NotFound } from "./NotFound";

export function C2NodesPage() {
  return (
    <>
      <h1>C2 Nodes</h1>
      <RecordTable
        items={c2Nodes}
        rowKey={(n) => n.id}
        getSearchText={(n) => `${n.name} ${n.function} ${n.id}`}
        searchPlaceholder="Filter C2 nodes by name or function…"
        columns={[
          { header: "Name", render: (n) => <Link to={`/c2-nodes/${n.id}`}>{n.name}</Link> },
          { header: "Organization", render: (n) => <EntityLink kind="organization" id={n.organizationId} /> },
          { header: "Function", render: (n) => n.function },
        ]}
      />
    </>
  );
}

export function C2NodeDetailPage() {
  const { id } = useParams();
  const node = id ? c2NodesById.get(id) : undefined;
  if (!node) return <NotFound kind="c2node" id={id} />;

  const nodeRoles = rolesInC2Node(node.id);

  return (
    <>
      <p className="breadcrumb">
        <Link to="/c2-nodes">C2 Nodes</Link> / {node.name}
      </p>
      <h1>{node.name}</h1>
      <dl className="field-list">
        <dt>Organization</dt>
        <dd>
          <EntityLink kind="organization" id={node.organizationId} />
        </dd>
        <dt>Function</dt>
        <dd>{node.function}</dd>
        {node.description && (
          <>
            <dt>Description</dt>
            <dd>{node.description}</dd>
          </>
        )}
        {node.producesArtifacts && node.producesArtifacts.length > 0 && (
          <>
            <dt>Produces artifacts</dt>
            <dd>
              <ul>
                {node.producesArtifacts.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </dd>
          </>
        )}
        <dt>Roles at this node</dt>
        <dd>
          {nodeRoles.length === 0 ? (
            <span className="muted">None</span>
          ) : (
            <ul>
              {nodeRoles.map((r) => (
                <li key={r.id}>
                  <EntityLink kind="role" id={r.id} />
                </li>
              ))}
            </ul>
          )}
        </dd>
        <dt>Doctrine sources</dt>
        <dd>
          <DoctrineSourceList sources={node.doctrineSource} />
        </dd>
      </dl>
    </>
  );
}
