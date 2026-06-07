import { useState } from "react";
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

export function StarsInput({ onAvaliar }) {
  const [hover, setHover] = useState(0);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [avaliado, setAvaliado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const LABELS = ["", "Péssimo", "Ruim", "Regular", "Bom", "Excelente!"];

  async function handleEnviar() {
    if (nota === 0) return;
    setEnviando(true);
    try {
      if (onAvaliar) await onAvaliar({ nota, comentario });
      setAvaliado(true);
    } catch {
      setAvaliado(true);
    } finally {
      setEnviando(false);
    }
  }

  if (avaliado) {
    return (
      <div className="stars-input-wrap">
        <div className="stars-sucesso">
          <span className="stars-check">✓</span>
          <p className="stars-sucesso-texto">Obrigado pela avaliação!</p>
          <div className="stars-display">
            {[1,2,3,4,5].map(i => (
              <span key={i} className={`star${i <= nota ? " ativa" : ""}`}>★</span>
            ))}
          </div>
          {comentario && <p className="stars-comentario-enviado">"{comentario}"</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="stars-input-wrap">
      <p className="stars-titulo">Avalie este serviço</p>
      <div className="stars-row">
        {[1,2,3,4,5].map(i => (
          <button key={i} type="button"
            className={`star-btn${i <= (hover || nota) ? " ativa" : ""}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setNota(i)}>★</button>
        ))}
      </div>
      <p className="stars-label">{LABELS[hover || nota] || "Selecione uma nota"}</p>
      <textarea
        className="stars-comentario"
        placeholder="Deixe um comentário (opcional)..."
        value={comentario}
        onChange={e => setComentario(e.target.value)}
        maxLength={300}
      />
      <button className="stars-enviar" onClick={handleEnviar} disabled={nota === 0 || enviando}>
        {enviando ? "Enviando..." : "Enviar avaliação"}
      </button>
    </div>
  );
}
