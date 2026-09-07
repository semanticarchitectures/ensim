import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { missions, missionsById, doctrineProcessesById, runResultsForMission } from "../data";
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
  const runs = runResultsForMission(mission.id); // newest first
  const [selectedRunId, setSelectedRunId] = useState<string | null>(runs[0]?.runId ?? null);
  const selectedRun = selectedRunId ? runs.find((r) => r.runId === selectedRunId) : undefined;

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
        {runs.length > 0 && (
          <>
            <dt>Run results</dt>
            <dd>
              <ul className="run-list">
                {runs.map((run) => (
                  <li key={run.runId}>
                    <button
                      type="button"
                      className={run.runId === selectedRunId ? "run-select active" : "run-select"}
                      onClick={() => setSelectedRunId(run.runId)}
                    >
                      {new Date(run.startedAt).toLocaleString()} — {run.status}
                      {run.federationPublished && <span className="muted"> (published to federation)</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </dd>
          </>
        )}
        <dt>Timeline</dt>
        <dd>
          {selectedRun ? (
            <>
              <p className="muted">
                Executed trace from run <code>{selectedRun.runId}</code> — real per-step status, simulated
                timestamps, and artifacts (sim-services). <code>Planned sequence</code> below shows what was scheduled.
              </p>
              <ol className="process-steps">
                {selectedRun.steps.map((step) => (
                  <li key={step.step}>
                    <p>
                      {step.description} <span className="step-status">{step.status}</span>
                    </p>
                    <p className="step-meta">Simulated time: {new Date(step.simulatedTimestamp).toLocaleString()}</p>
                    {step.artifactProduced && <p className="step-artifact">Produces: {step.artifactProduced}</p>}
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <p className="muted">
              Planned sequence — no executed run yet. Run it with{" "}
              <code>npm run run-mission --workspace=@ensim/sim-services -- {mission.id}</code>.
            </p>
          )}
          <details>
            <summary>Planned sequence ({mission.timeline.length} steps)</summary>
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
          </details>
        </dd>
        <dt>Doctrine sources</dt>
        <dd>
          <DoctrineSourceList sources={mission.doctrineSource} />
        </dd>
      </dl>
    </>
  );
}
