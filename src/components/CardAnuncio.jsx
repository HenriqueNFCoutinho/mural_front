import { useNavigate } from "react-router-dom";
import "./CardAnuncio.css";

function iniciais(nome) {
  if (!nome) return "?";
  return nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

function Stars({ value }) {
  return (
    <div className="card-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(value || 0) ? "#E8A020" : "#DDD", fontSize: 14 }}>★</span>
      ))}
      {value > 0 && <span className="card-media">{Number(value).toFixed(1)}</span>}
    </div>
  );
}

export default function CardAnuncio({ anuncio }) {
  const navigate = useNavigate();

  return (
    <article className="card" onClick={() => navigate(`/anuncio/${anuncio.id}`)}>
      <div className="card-top">
        <span className="card-cat-badge">Cat. {anuncio.categoria_id}</span>
        <span className="card-preco">R$ {Number(anuncio.preco).toFixed(2)}</span>
      </div>
      <h2 className="card-titulo">{anuncio.titulo}</h2>
      <p className="card-desc">{anuncio.descricao}</p>
      <div className="card-footer">
        <div className="card-author">
          <div className="avatar">P{anuncio.prestador_id}</div>
          <p className="author-nome">Prestador #{anuncio.prestador_id}</p>
        </div>
        <Stars value={anuncio.media_avaliacao || 0} />
      </div>
    </article>
  );
}
