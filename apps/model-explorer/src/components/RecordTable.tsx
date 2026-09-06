import { useState } from "react";

export interface Column<T> {
  header: string;
  render: (item: T) => React.ReactNode;
}

/** A filterable table for a list page. Filtering is a simple client-side text
 * match — v1 scope is table/list/detail only, per ARCHITECTURE.md Section 13. */
export function RecordTable<T>({
  items,
  columns,
  getSearchText,
  searchPlaceholder = "Filter…",
  rowKey,
}: {
  items: T[];
  columns: Column<T>[];
  getSearchText: (item: T) => string;
  searchPlaceholder?: string;
  rowKey: (item: T) => string;
}) {
  const [query, setQuery] = useState("");
  const filtered = query
    ? items.filter((item) => getSearchText(item).toLowerCase().includes(query.toLowerCase()))
    : items;

  return (
    <div>
      <input
        className="filter-input"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={searchPlaceholder}
        aria-label={searchPlaceholder}
      />
      <table className="record-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.header}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.map((item) => (
            <tr key={rowKey(item)}>
              {columns.map((col) => (
                <td key={col.header}>{col.render(item)}</td>
              ))}
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="muted">
                No records match "{query}".
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <p className="record-count">
        {filtered.length} of {items.length} records
      </p>
    </div>
  );
}
