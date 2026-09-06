export function NotFound({ kind, id }: { kind: string; id: string | undefined }) {
  return (
    <div className="not-found">
      <h1>Not found</h1>
      <p>
        No {kind} record with id <code>{id}</code>.
      </p>
    </div>
  );
}
