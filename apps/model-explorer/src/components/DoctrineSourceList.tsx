import type { DoctrineSource } from "@ensim/org-doctrine-model";

/** Renders a record's doctrineSource citations, surfacing the `note` field
 * (used to flag unverified facts, per AGENTS.md Section 2) instead of leaving
 * it buried in JSON someone has to open by hand. */
export function DoctrineSourceList({ sources }: { sources: DoctrineSource[] }) {
  return (
    <ul className="doctrine-sources">
      {sources.map((source, i) => (
        <li key={i} className={source.note ? "has-note" : undefined}>
          <span className="publication">
            {source.url ? (
              <a href={source.url} target="_blank" rel="noreferrer">
                {source.publication}
              </a>
            ) : (
              source.publication
            )}
          </span>
          {source.section && <span className="section"> — {source.section}</span>}
          {source.note && (
            <div className="note">
              <strong>Note:</strong> {source.note}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
