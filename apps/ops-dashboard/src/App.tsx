import { useState } from "react";
import {
  missions,
  organizationsById,
  messagesForMission,
  runResultsForMission,
  latestAtoLine,
  messageSummary,
  actorDisplayName,
  type C2Message,
} from "./data";

const MESSAGE_TYPE_LABEL: Record<C2Message["messageType"], string> = {
  TaskingRequest: "Tasking Request",
  ValidationRecord: "Validation",
  ATOLine: "ATO Line",
  ExecutionStatus: "Execution",
  MissionReport: "Mission Report",
};

export function App() {
  const [selectedMissionId, setSelectedMissionId] = useState(missions[0]?.id);
  const mission = missions.find((m) => m.id === selectedMissionId);

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>ENSIM Ops Dashboard</h1>
        <p className="muted">
          Process/status view of the C2 tasking sequence — static reader, no live federation connection (v1 scope;
          see README).
        </p>
        {missions.length > 1 && (
          <select value={selectedMissionId} onChange={(e) => setSelectedMissionId(e.target.value)}>
            {missions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        )}
      </header>

      {!mission ? (
        <p className="muted">No mission data found.</p>
      ) : (
        <MissionBoard missionId={mission.id} missionName={mission.name} missionStatus={mission.status} />
      )}
    </div>
  );
}

function MissionBoard({
  missionId,
  missionName,
  missionStatus,
}: {
  missionId: string;
  missionName: string;
  missionStatus: string;
}) {
  const messages = messagesForMission(missionId);
  const atoLine = latestAtoLine(missionId);
  const runs = runResultsForMission(missionId);
  const latestRun = runs[0];

  return (
    <div className="board">
      <div className="board-title">
        <h2>{missionName}</h2>
        <span className="status-pill">{missionStatus}</span>
      </div>

      <section className="panel">
        <h3>ATO state</h3>
        {atoLine ? (
          <dl className="field-list">
            <dt>Tasked unit</dt>
            <dd>{organizationsById.get(atoLine.taskedOrganizationId)?.name ?? atoLine.taskedOrganizationId}</dd>
            <dt>Tasking</dt>
            <dd>{atoLine.taskingSummary}</dd>
            {atoLine.effectiveDate && (
              <>
                <dt>Effective</dt>
                <dd>{atoLine.effectiveDate}</dd>
              </>
            )}
            <dt>Issued by</dt>
            <dd>{actorDisplayName(atoLine.producedBy)}</dd>
          </dl>
        ) : (
          <p className="muted">No ATO line issued yet for this mission.</p>
        )}
      </section>

      <section className="panel">
        <h3>C2 node hand-offs</h3>
        {messages.length === 0 ? (
          <p className="muted">No C2 messages recorded for this mission.</p>
        ) : (
          <ol className="message-sequence">
            {messages.map((message) => (
              <li key={message.id}>
                <span className={`message-type message-type--${message.messageType}`}>
                  {MESSAGE_TYPE_LABEL[message.messageType]}
                </span>
                <span className="message-actor">{actorDisplayName(message.producedBy)}</span>
                <p className="message-summary">{messageSummary(message)}</p>
                <p className="message-time">{new Date(message.timestamp).toLocaleString()}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="panel">
        <h3>Mission timeline</h3>
        {!latestRun ? (
          <p className="muted">No executed run yet — see model-explorer's Mission page or run sim-services.</p>
        ) : (
          <>
            <p className="muted">
              From run {latestRun.runId} ({latestRun.status}, started {new Date(latestRun.startedAt).toLocaleString()})
            </p>
            <ol className="mission-steps">
              {latestRun.steps.map((step) => (
                <li key={step.step}>
                  <span className="step-status">{step.status}</span> {step.description}
                  <span className="step-time"> — {new Date(step.simulatedTimestamp).toLocaleString()}</span>
                </li>
              ))}
            </ol>
          </>
        )}
      </section>
    </div>
  );
}
