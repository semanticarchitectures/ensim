import { Link, useParams } from "react-router-dom";
import { interactions, interactionsById } from "../data";
import { RecordTable } from "../components/RecordTable";
import { DoctrineSourceList } from "../components/DoctrineSourceList";
import { EntityLink } from "../components/EntityLink";
import { NotFound } from "./NotFound";

export function InteractionsPage() {
  return (
    <>
      <h1>Interactions</h1>
      <p className="muted">
        The mission execution interaction network — who and what interacts with whom, structurally (not tied to one
        run). Sits alongside Doctrine Processes as a finer-grained, personnel-and-systems view of how the enterprise
        operates.
      </p>
      <RecordTable
        items={interactions}
        rowKey={(i) => i.id}
        getSearchText={(i) => `${i.id} ${i.interactionType} ${i.description}`}
        searchPlaceholder="Filter interactions…"
        columns={[
          { header: "From", render: (i) => <EntityLink kind={i.from.kind} id={i.from.id} /> },
          { header: "Type", render: (i) => <Link to={`/interactions/${i.id}`}>{i.interactionType}</Link> },
          { header: "To", render: (i) => <EntityLink kind={i.to.kind} id={i.to.id} /> },
        ]}
      />
    </>
  );
}

export function InteractionDetailPage() {
  const { id } = useParams();
  const interaction = id ? interactionsById.get(id) : undefined;
  if (!interaction) return <NotFound kind="interaction" id={id} />;

  return (
    <>
      <p className="breadcrumb">
        <Link to="/interactions">Interactions</Link> / {interaction.id}
      </p>
      <h1>
        <EntityLink kind={interaction.from.kind} id={interaction.from.id} /> {interaction.interactionType}{" "}
        <EntityLink kind={interaction.to.kind} id={interaction.to.id} />
      </h1>
      <dl className="field-list">
        <dt>Description</dt>
        <dd>{interaction.description}</dd>
        <dt>Doctrine sources</dt>
        <dd>
          <DoctrineSourceList sources={interaction.doctrineSource} />
        </dd>
      </dl>
    </>
  );
}
