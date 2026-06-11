import "./Modal.css";

export default function Modal({ aberto, titulo, mensagem, onConfirmar, onCancelar, textoConfirmar = "Confirmar", perigo = false }) {
  if (!aberto) return null;

  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <h3 className="modal-titulo">{titulo}</h3>
        <p className="modal-mensagem">{mensagem}</p>
        <div className="modal-acoes">
          <button className="modal-btn-cancelar" onClick={onCancelar}>Cancelar</button>
          <button className={`modal-btn-confirmar${perigo ? " perigo" : ""}`} onClick={onConfirmar}>
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
