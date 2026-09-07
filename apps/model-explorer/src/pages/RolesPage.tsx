import { Link, useParams } from "react-router-dom";
import { roles, rolesById, roleReportsChain, directReports, interactionsForParticipant } from "../data";
import { RecordTable } from "../components/RecordTable";
import { DoctrineSourceList } from "../components/DoctrineSourceList";
import { EntityLink } from "../components/EntityLink";
import { NotFound } from "./NotFound";

export function RolesPage() {
  return (
    <>
      <h1>Roles</h1>
      <RecordTable
        items={roles}
        rowKey={(r) => r.id}
        getSearchText={(r) => `${r.name} ${r.id}`}
        searchPlaceholder="Filter roles by name…"
        columns={[
          { header: "Name", render: (r) => <Link to={`/roles/${r.id}`}>{r.name}</Link> },
          { header: "Organization", render: (r) => <EntityLink kind="organization" id={r.organizationId} /> },
          { header: "C2 node", render: (r) => <EntityLink kind="c2node" id={r.c2NodeId} /> },
          { header: "Reports to", render: (r) => <EntityLink kind="role" id={r.reportsToRoleId} /> },
        ]}
      />
    </>
  );
}

export function RoleDetailPage() {
  const { id } = useParams();
  const role = id ? rolesById.get(id) : undefined;
  if (!role) return <NotFound kind="role" id={id} />;

  const chain = roleReportsChain(role.id).slice(1);
  const reports = directReports(role.id);
  const roleInteractions = interactionsForParticipant("role", role.id);

  return (
    <>
      <p className="breadcrumb">
        <Link to="/roles">Roles</Link> / {role.name}
      </p>
      <h1>{role.name}</h1>
      <dl className="field-list">
        <dt>Organization</dt>
        <dd>
          <EntityLink kind="organization" id={role.organizationId} />
        </dd>
        <dt>C2 node</dt>
        <dd>
          <EntityLink kind="c2node" id={role.c2NodeId} />
        </dd>
        <dt>Responsibilities</dt>
        <dd>
          <ul>
            {role.responsibilities.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </dd>
        {role.authorities && role.authorities.length > 0 && (
          <>
            <dt>Authorities</dt>
            <dd>
              <ul>
                {role.authorities.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </dd>
          </>
        )}
        <dt>Reporting chain</dt>
        <dd>
          {chain.length === 0 ? (
            <span className="muted">No superior role on record</span>
          ) : (
            chain.map((r, i) => (
              <span key={r.id}>
                {i > 0 && " → "}
                <EntityLink kind="role" id={r.id} />
              </span>
            ))
          )}
        </dd>
        <dt>Direct reports</dt>
        <dd>
          {reports.length === 0 ? (
            <span className="muted">None</span>
          ) : (
            <ul>
              {reports.map((r) => (
                <li key={r.id}>
                  <EntityLink kind="role" id={r.id} />
                </li>
              ))}
            </ul>
          )}
        </dd>
        <dt>Interactions</dt>
        <dd>
          {roleInteractions.length === 0 ? (
            <span className="muted">None</span>
          ) : (
            <ul>
              {roleInteractions.map((i) => (
                <li key={i.id}>
                  <EntityLink kind={i.from.kind} id={i.from.id} /> —{" "}
                  <span className="step-status">{i.interactionType}</span> →{" "}
                  <EntityLink kind={i.to.kind} id={i.to.id} />
                  <div className="step-meta">{i.description}</div>
                </li>
              ))}
            </ul>
          )}
        </dd>
        <dt>Doctrine sources</dt>
        <dd>
          <DoctrineSourceList sources={role.doctrineSource} />
        </dd>
      </dl>
    </>
  );
}
