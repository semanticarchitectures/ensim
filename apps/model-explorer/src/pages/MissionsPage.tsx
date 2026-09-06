import { Link, useParams } from "react-router-dom";
import { missions, missionsById, doctrineProcessesById } from "../data";
import { RecordTable } from "../components/RecordTable";
import { DoctrineSourceList } from "../components/DoctrineSourceList";
import { EntityLink } from "../components/EntityLink";
import { NotFound } from "./NotFound";

export function MissionsPage() {
  return (
    <>
      <h1>Missions</h1>
      <RecordTable
        items={missions}
        rowKey={(m) => m.id}
        getSearchText={(m) => `${m.name} ${m.id} ${m.status}`}
        searchPlaceholder="Filter missions by name or status…"
        columns={[
          { header: "Name", render: (m) => <Link to={`/missions/${m.id}`}>{m.name}</Link> },
          { header: "Status", render: (m) => m.status },
          {
            header: "Fictionalized",
            render: (m) => (m.fictionalized ? "Yes" : <span className="warning">NO — verify</span>),
          },
        ]}
      />
    </>
  );
}

export function MissionDetailPage() {
  const { id } = useParams();
  const mission = id ? missionsById.get(id) : undefined;
  if (!mission) return <NotFound kind="mission" id={id} />;

  const process = doctrineProcessesById.get(mission.doctrineProcessId);

  return (
    <>
      <p className="breadcrumb">
        <Link to="/missions">Missions</Link> / {mission.name}
      </p>
      <h1>{mission.name}</h1>
      {!mission.fictionalized && (
        <p className="warning-banner">
          This record is NOT marked fictionalized — per AGENTS.md Section 4, that should only be false by explicit,
          deliberate human instruction. Verify before treating this as anything other than a real mission depiction.
        </p>
      )}
      <dl className="field-list">
        <dt>Status</dt>
        <dd>{mission.status}</dd>
        <dt>Fictionalized</dt>
        <dd>{mission.fictionalized ? "Yes" : "No"}</dd>
        {mission.precedent && (
          <>
            <dt>Precedent</dt>
            <dd>{mission.precedent}</dd>
          </>
        )}
        <dt>Doctrine process</dt>
        <dd>
          <EntityLink kind="process" id={mission.doctrineProcessId} />
        </dd>
        {mission.route && (
          <>
            <dt>Route</dt>
            <dd>
              {mission.route.origin} → {mission.route.destination}
              {mission.route.stagingNote && (
                <div className="note">
                  <strong>Note:</strong> {mission.route.stagingNote}
                </div>
              )}
            </dd>
          </>
        )}
        {mission.cargo && (
          <>
            <dt>Cargo</dt>
            <dd>
              {mission.cargo.type}
              {mission.cargo.contents && ` — ${mission.cargo.contents}`}
              {mission.cargo.bundleCount != null && ` (${mission.cargo.bundleCount} bundles)`}
            </dd>
          </>
        )}
        <dt>Organizations involved</dt>
        <dd>
          <ul>
            {mission.organizationsInvolved.map((orgId) => (
              <li key={orgId}>
                <EntityLink kind="organization" id={orgId} />
              </li>
            ))}
          </ul>
        </dd>
        {mission.rolesInvolved && mission.rolesInvolved.length > 0 && (
          <>
            <dt>Roles involved</dt>
            <dd>
              <ul>
                {mission.rolesInvolved.map((roleId) => (
                  <li key={roleId}>
                    <EntityLink kind="role" id={roleId} />
                  </li>
                ))}
              </ul>
            </dd>
          </>
        )}
        <dt>Timeline</dt>
        <dd>
          <p className="muted">
            Planned sequence — this is not yet an executed trace (that requires <code>sim-services</code>, not built
            yet; see ARCHITECTURE.md Section 13).
          </p>
          <ol className="process-steps">
            {mission.timeline
              .slice()
              .sort((a, b) => a.step - b.step)
              .map((step) => {
                const processStep =
                  step.doctrineProcessStep != null
                    ? process?.steps.find((s) => s.stepNumber === step.doctrineProcessStep)
                    : undefined;
                return (
                  <li key={step.step}>
                    <p>{step.description}</p>
                    {processStep && (
                      <p className="step-meta">
                        Doctrine process step {processStep.stepNumber}: {processStep.description}
                      </p>
                    )}
                  </li>
                );
              })}
          </ol>
        </dd>
        <dt>Doctrine sources</dt>
        <dd>
          <DoctrineSourceList sources={mission.doctrineSource} />
        </dd>
      </dl>
    </>
  );
}
