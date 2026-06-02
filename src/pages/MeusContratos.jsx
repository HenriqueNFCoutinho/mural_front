import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./MeusContratos.css";

export default function MeusContratos() {
  const navigate = useNavigate();

  return (
    <div className="contratos-root">
      <header className="contratos-nav">
        <button className="contratos-back" onClick={() => navigate("/")}>
          <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
            <path d="M12 15L7 10l5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Voltar
        </button>
        <span className="contratos-nav-title">Meus contratos</span>
        <div style={{ width: 80 }} />
      </header>
      <div className="contratos-body">
        <div className="contratos-centro">
          <p className="contratos-vazio-titulo">Em breve!</p>
          <p className="contratos-vazio-sub">A listagem de contratos será disponibilizada em breve.</p>
          <button className="btn-explorar" onClick={() => navigate("/")}>Explorar serviços</button>
        </div>
      </div>
    </div>
  );
}
