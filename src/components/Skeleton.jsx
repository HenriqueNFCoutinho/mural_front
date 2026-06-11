import "./Skeleton.css";

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="sk-line sk-top">
        <span className="sk-badge" />
        <span className="sk-preco" />
      </div>
      <span className="sk-titulo" />
      <span className="sk-desc" />
      <span className="sk-desc sk-desc-curto" />
      <div className="sk-footer">
        <span className="sk-avatar" />
        <span className="sk-nome" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ quantidade = 6 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: quantidade }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="skeleton-row">
      <span className="sk-avatar" />
      <span className="sk-nome" />
      <span className="sk-email" />
    </div>
  );
}
