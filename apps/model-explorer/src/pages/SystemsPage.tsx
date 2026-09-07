import { Link, useParams } from "react-router-dom";
import { systems, systemsById, interactionsForParticipant } from "../data";
import { RecordTable } from "../components/RecordTable";
import { DoctrineSourceList } from "../components/DoctrineSourceList";
import { EntityLink } from "../components/EntityLink";
import { NotFound } from "./NotFound";

export function SystemsPage() {
  return (
    <>
      <h1>Systems</h1>
      <p className="muted">
        Equipment/infrastructure nodes in the mission execution interaction network — deliberately representative,
        not real fielded systems (AGENTS.md Section 3).
      </p>
      <RecordTable
        items={systems}
        rowKey={(s) => s.id}
        getSearchText={(s) => `${s.name} ${s.type} ${s.id}`}
        searchPlaceholder="Filter systems by name or type…"
        columns={[
          { header: "Name", render: (s) => <Link to={`/systems/${s.id}`}>{s.name}</Link> },
          { header: "Type", render: (s) => s.type },
        ]}
      />
    </>
  );
}

export function SystemDetailPage() {
  const { id } = useParams();
  const system = id ? systemsById.get(id) : undefined;
  if (!system) return <NotFound kind="system" id={id} />;

  const systemInteractions = interactionsForParticipant("system", system.id);

  return (
    <>
      <p className="breadcrumb">
        <Link to="/systems">Systems</Link> / {system.name}
      </p>
      <h1>{system.name}</h1>
      <dl className="field-list">
        <dt>Type</dt>
        <dd>{system.type}</dd>
        <dt>Description</dt>
        <dd>{system.description}</dd>
        <dt>Interactions</dt>
        <dd>
          {systemInteractions.length === 0 ? (
            <span className="muted">None</span>
          ) : (
            <ul>
              {systemInteractions.map((i) => (
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
          <DoctrineSourceList sources={system.doctrineSource} />
        </dd>
      </dl>
    </>
  );
}
