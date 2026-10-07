import { FILTER_LABEL, type LibraryFilter } from "@/lib/catalog/catalog";

/** Filter chips, shown only when they would change the list (see `availableFilters`). */
export function LibraryFilters({
  filters,
  value,
  onChange,
}: {
  filters: { filter: LibraryFilter; count: number }[];
  value: LibraryFilter;
  onChange: (filter: LibraryFilter) => void;
}) {
  if (filters.length === 0) return null;
  return (
    <div className="lib-filters" role="group" aria-label="Filtrer les cours">
      {filters.map(({ filter, count }) => (
        <button
          key={filter}
          type="button"
          className={`lib-chip${value === filter ? " is-on" : ""}`}
          aria-pressed={value === filter}
          onClick={() => onChange(filter)}
        >
          {FILTER_LABEL[filter]} <b>{count}</b>
        </button>
      ))}
    </div>
  );
}
