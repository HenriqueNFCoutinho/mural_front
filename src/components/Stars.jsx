import "./Stars.css";

export function StarsDisplay({ value }) {
  return (
    <div className="stars-display">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star${i <= Math.round(value || 0) ? " ativa" : ""}`}>★</span>
      ))}
      {value > 0 && <span className="stars-valor">{Number(value).toFixed(1)}</span>}
    </div>
  );
}
