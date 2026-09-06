import { Link, useParams } from "react-router-dom";
import { organizations, organizationsById, organizationAncestorChain, childOrganizations, rolesInOrganization, c2NodesInOrganization } from "../data";
import { RecordTable } from "../components/RecordTable";
import { DoctrineSourceList } from "../components/DoctrineSourceList";
import { EntityLink } from "../components/EntityLink";
import { NotFound } from "./NotFound";

export function OrganizationsPage() {
  return (
    <>
      <h1>Organizations</h1>
      <RecordTable
        items={organizations}
        rowKey={(o) => o.id}
        getSearchText={(o) => `${o.name} ${o.shortName ?? ""} ${o.type} ${o.id}`}
        searchPlaceholder="Filter organizations by name, short name, or type…"
        columns={[
          { header: "Name", render: (o) => <Link to={`/organizations/${o.id}`}>{o.name}</Link> },
          { header: "Short name", render: (o) => o.shortName ?? <span className="muted">—</span> },
          { header: "Type", render: (o) => o.type },
          { header: "Echelon", render: (o) => o.echelon },
          { header: "Parent", render: (o) => <EntityLink kind="organization" id={o.parentId} /> },
        ]}
      />
    </>
  );
}

export function OrganizationDetailPage() {
  const { id } = useParams();
  const org = id ? organizationsById.get(id) : undefined;
  if (!org) return <NotFound kind="organization" id={id} />;

  const ancestors = organizationAncestorChain(org.id).slice(1);
  const children = childOrganizations(org.id);
  const orgRoles = rolesInOrganization(org.id);
  const orgC2Nodes = c2NodesInOrganization(org.id);

  return (
    <>
      <p className="breadcrumb">
        <Link to="/organizations">Organizations</Link> / {org.name}
      </p>
      <h1>
        {org.name} {org.shortName && <span className="short-name">({org.shortName})</span>}
      </h1>
      <dl className="field-list">
        <dt>Type</dt>
        <dd>{org.type}</dd>
        <dt>Echelon</dt>
        <dd>{org.echelon}</dd>
        {org.homeStation && (
          <>
            <dt>Home station</dt>
            <dd>{org.homeStation}</dd>
          </>
        )}
        {org.description && (
          <>
            <dt>Description</dt>
            <dd>{org.description}</dd>
          </>
        )}
        <dt>Parent chain</dt>
        <dd>
          {ancestors.length === 0 ? (
            <span className="muted">Top-level organization</span>
          ) : (
            ancestors.map((a, i) => (
              <span key={a.id}>
                {i > 0 && " → "}
                <EntityLink kind="organization" id={a.id} />
              </span>
            ))
          )}
        </dd>
        <dt>Child organizations</dt>
        <dd>
          {children.length === 0 ? (
            <span className="muted">None</span>
          ) : (
            <ul>
              {children.map((c) => (
                <li key={c.id}>
                  <EntityLink kind="organization" id={c.id} />
                </li>
              ))}
            </ul>
          )}
        </dd>
        <dt>Roles</dt>
        <dd>
          {orgRoles.length === 0 ? (
            <span className="muted">None</span>
          ) : (
            <ul>
              {orgRoles.map((r) => (
                <li key={r.id}>
                  <EntityLink kind="role" id={r.id} />
                </li>
              ))}
            </ul>
          )}
        </dd>
        <dt>C2 nodes</dt>
        <dd>
          {orgC2Nodes.length === 0 ? (
            <span className="muted">None</span>
          ) : (
            <ul>
              {orgC2Nodes.map((n) => (
                <li key={n.id}>
                  <EntityLink kind="c2node" id={n.id} />
                </li>
              ))}
            </ul>
          )}
        </dd>
        <dt>Doctrine sources</dt>
        <dd>
          <DoctrineSourceList sources={org.doctrineSource} />
        </dd>
      </dl>
    </>
  );
}
