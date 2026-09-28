export default function SearchBar({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  categories,
}) {
  return (
    <div className="search-bar">
      <input
        type="search"
        placeholder="Search listings…"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
      />
      {onCategoryChange && (
        <select value={category} onChange={(e) => onCategoryChange(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      )}

      <style>{`
        .search-bar {
          display: flex;
          gap: 10px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .search-bar input,
        .search-bar select {
          border: 1px solid var(--border);
          background: var(--bg-raised);
          color: var(--text);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 0.95rem;
        }
        .search-bar input {
          flex: 1;
          min-width: 200px;
        }
      `}</style>
    </div>
  )
}
