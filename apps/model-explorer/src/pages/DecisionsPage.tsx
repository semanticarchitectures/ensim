import { Link, useParams } from "react-router-dom";
import { decisions, decisionsById } from "../data";
import { RecordTable } from "../components/RecordTable";
import { DoctrineSourceList } from "../components/DoctrineSourceList";
import { EntityLink } from "../components/EntityLink";
import { NotFound } from "./NotFound";

export function DecisionsPage() {
  return (
    <>
      <h1>Decisions</h1>
      <p className="muted">
        Choice points a Role makes during mission execution — what informs the decision, the criteria applied, and
        the possible outcomes. A finer grain than Doctrine Processes (organizational tasking) or Interactions
        (structural edges): what a person actually has to decide.
      </p>
      <RecordTable
        items={decisions}
        rowKey={(d) => d.id}
        getSearchText={(d) => `${d.name} ${d.id}`}
        searchPlaceholder="Filter decisions by name…"
        columns={[
          { header: "Name", render: (d) => <Link to={`/decisions/${d.id}`}>{d.name}</Link> },
          { header: "Role", render: (d) => <EntityLink kind="role" id={d.roleId} /> },
        ]}
      />
    </>
  );
}

export function DecisionDetailPage() {
  const { id } = useParams();
  const decision = id ? decisionsById.get(id) : undefined;
  if (!decision) return <NotFound kind="decision" id={id} />;

  return (
    <>
      <p className="breadcrumb">
        <Link to="/decisions">Decisions</Link> / {decision.name}
      </p>
      <h1>{decision.name}</h1>
      <dl className="field-list">
        <dt>Role</dt>
        <dd>
          <EntityLink kind="role" id={decision.roleId} />
        </dd>
        <dt>Description</dt>
        <dd>{decision.description}</dd>
        <dt>Informed by</dt>
        <dd>
          <ul>
            {decision.informedBy.map((p, i) => (
              <li key={i}>
                <EntityLink kind={p.kind} id={p.id} />
              </li>
            ))}
          </ul>
        </dd>
        <dt>Criteria</dt>
        <dd>{decision.criteria}</dd>
        <dt>Possible outcomes</dt>
        <dd>
          <ul>
            {decision.possibleOutcomes.map((o, i) => (
              <li key={i}>{o}</li>
            ))}
          </ul>
        </dd>
        <dt>Doctrine sources</dt>
        <dd>
          <DoctrineSourceList sources={decision.doctrineSource} />
        </dd>
      </dl>
    </>
  );
}
