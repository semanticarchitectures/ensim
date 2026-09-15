import type { CommsLink } from "@ensim/org-doctrine-model";

/** Renders a System's or Interaction's `commsLink` — verbal vs. digital, medium, and (for
 * digital/mixed links) protocol and message format — so this detail is visible to a human
 * reviewer instead of only living in JSON someone has to open by hand. */
export function CommsLinkDetail({ link }: { link: CommsLink }) {
  return (
    <dl className="comms-link">
      <dt>Mode</dt>
      <dd className={`comms-mode comms-mode-${link.mode.toLowerCase()}`}>{link.mode}</dd>
      <dt>Medium</dt>
      <dd>{link.medium}</dd>
      {link.protocol && (
        <>
          <dt>Protocol</dt>
          <dd>{link.protocol}</dd>
        </>
      )}
      {link.format && (
        <>
          <dt>Format</dt>
          <dd>{link.format}</dd>
        </>
      )}
    </dl>
  );
}

/** Compact inline badge for table rows, e.g. the Interactions list's "Mode" column. */
export function CommsModeBadge({ link }: { link: CommsLink | undefined }) {
  if (!link) return <span className="muted">—</span>;
  return <span className={`comms-mode comms-mode-${link.mode.toLowerCase()}`}>{link.mode}</span>;
}
