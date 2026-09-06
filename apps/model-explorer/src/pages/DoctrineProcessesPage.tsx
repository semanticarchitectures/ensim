import { Link, useParams } from "react-router-dom";
import { doctrineProcesses, doctrineProcessesById, missionsUsingProcess } from "../data";
import { RecordTable } from "../components/RecordTable";
import { DoctrineSourceList } from "../components/DoctrineSourceList";
import { EntityLink } from "../components/EntityLink";
import { NotFound } from "./NotFound";

export function DoctrineProcessesPage() {
  return (
    <>
      <h1>Doctrine Processes</h1>
      <RecordTable
        items={doctrineProcesses}
        rowKey={(p) => p.id}
        getSearchText={(p) => `${p.name} ${p.id}`}
        searchPlaceholder="Filter processes by name…"
        columns={[
          { header: "Name", render: (p) => <Link to={`/doctrine-processes/${p.id}`}>{p.name}</Link> },
          { header: "Steps", render: (p) => p.steps.length },
        ]}
      />
    </>
  );
}

export function DoctrineProcessDetailPage() {
  const { id } = useParams();
  const process = id ? doctrineProcessesById.get(id) : undefined;
  if (!process) return <NotFound kind="doctrine process" id={id} />;

  const usedByMissions = missionsUsingProcess(process.id);

  return (
    <>
      <p className="breadcrumb">
        <Link to="/doctrine-processes">Doctrine Processes</Link> / {process.name}
      </p>
      <h1>{process.name}</h1>
      <dl className="field-list">
        {process.description && (
          <>
            <dt>Description</dt>
            <dd>{process.description}</dd>
          </>
        )}
        <dt>Steps</dt>
        <dd>
          <ol className="process-steps">
            {process.steps
              .slice()
              .sort((a, b) => a.stepNumber - b.stepNumber)
              .map((step) => (
                <li key={step.stepNumber}>
                  <p>{step.description}</p>
                  <p className="step-meta">
                    {step.actorRoleId && (
                      <>
                        Actor (role): <EntityLink kind="role" id={step.actorRoleId} />{" "}
                      </>
                    )}
                    {step.actorC2NodeId && (
                      <>
                        Actor (C2 node): <EntityLink kind="c2node" id={step.actorC2NodeId} />{" "}
                      </>
                    )}
                    {step.actorOrganizationId && (
                      <>
                        Actor (organization): <EntityLink kind="organization" id={step.actorOrganizationId} />{" "}
                      </>
                    )}
                    {!step.actorRoleId && !step.actorC2NodeId && !step.actorOrganizationId && (
                      <span className="muted">No actor on record</span>
                    )}
                  </p>
                  {step.producesArtifact && <p className="step-artifact">Produces: {step.producesArtifact}</p>}
                </li>
              ))}
          </ol>
        </dd>
        <dt>Used by missions</dt>
        <dd>
          {usedByMissions.length === 0 ? (
            <span className="muted">None</span>
          ) : (
            <ul>
              {usedByMissions.map((m) => (
                <li key={m.id}>
                  <EntityLink kind="mission" id={m.id} />
                </li>
              ))}
            </ul>
          )}
        </dd>
        <dt>Doctrine sources</dt>
        <dd>
          <DoctrineSourceList sources={process.doctrineSource} />
        </dd>
      </dl>
    </>
  );
}
