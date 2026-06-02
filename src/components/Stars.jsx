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
  const [selecionado, setSelecionado] = useState(0);
  const [avaliado, setAvaliado] = useState(false);

  const LABELS = ["", "Péssimo", "Ruim", "Regular", "Bom", "Excelente!"];

  function handleClick(valor) {
    setSelecionado(valor);
    setAvaliado(true);
    if (onAvaliar) onAvaliar(valor);
  }

  return (
    <div className="stars-input-wrap">
      {avaliado ? (
        <div className="stars-sucesso">
          <span className="stars-check">✓</span>
          <p className="stars-sucesso-texto">Obrigado pela avaliação!</p>
          <div className="stars-display">
            {[1,2,3,4,5].map(i => (
              <span key={i} className={`star${i <= selecionado ? " ativa" : ""}`}>★</span>
            ))}
          </div>
        </div>
      ) : (
        <>
          <p className="stars-titulo">Avalie este serviço</p>
          <div className="stars-row">
            {[1,2,3,4,5].map(i => (
              <button key={i} type="button"
                className={`star-btn${i <= (hover || selecionado) ? " ativa" : ""}`}
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(0)}
                onClick={() => handleClick(i)}>★</button>
            ))}
          </div>
          <p className="stars-label">{LABELS[hover] || "Passe o mouse para avaliar"}</p>
        </>
      )}
    </div>
  );
}
