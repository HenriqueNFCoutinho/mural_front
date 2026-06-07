import { StarsDisplay } from "./Stars";
import "./ListaAvaliacoes.css";

export default function ListaAvaliacoes({ avaliacoes }) {
  if (!avaliacoes || avaliacoes.length === 0) {
    return (
      <div className="avaliacoes-vazio">
        <p>Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
      </div>
    );
  }

  const media = avaliacoes.reduce((acc, a) => acc + a.nota, 0) / avaliacoes.length;

  return (
    <div className="avaliacoes-lista">
      <div className="avaliacoes-resumo">
        <span className="avaliacoes-media">{media.toFixed(1)}</span>
        <div>
          <StarsDisplay value={media} />
          <p className="avaliacoes-total">{avaliacoes.length} avaliaçõe{avaliacoes.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {avaliacoes.map(a => (
        <div key={a.id} className="avaliacao-item">
          <div className="avaliacao-item-top">
            <StarsDisplay value={a.nota} />
            <span className="avaliacao-data">
              {a.criado_em ? new Date(a.criado_em).toLocaleDateString("pt-BR") : ""}
            </span>
          </div>
          {a.comentario && <p className="avaliacao-comentario">{a.comentario}</p>}
        </div>
      ))}
    </div>
  );
}
