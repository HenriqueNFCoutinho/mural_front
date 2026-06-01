import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listarContratos, atualizarContrato, criarAvaliacao, estaLogado } from "../services/api";
import "./MeusContratos.css";

const STATUS_CONFIG = {
  PENDENTE:   { label: "Pendente",   cor: "#E8A020", bg: "#FFF8E0" },
  ATIVO:      { label: "Ativo",      cor: "#1D9E75", bg: "#E1F5EE" },
  CONCLUIDO:  { label: "Concluído",  cor: "#3B5FCC", bg: "#EAF0FF" },
  CANCELADO:  { label: "Cancelado",  cor: "#C0392B", bg: "#FDE8E8" },
};

// Mockado — trocar por chamada real quando backend estiver pronto
const CONTRATOS_MOCK = [
  { id: 1, anuncio_titulo: "Monitoria de Cálculo I e II", prestador: "Rafael Batista", valor: 35, status: "PENDENTE", criado_em: "01/06/2026" },
  { id: 2, anuncio_titulo: "Instalação elétrica e tomadas", prestador: "Jonas Silva", valor: 120, status: "ATIVO", criado_em: "28/05/2026" },
  { id: 3, anuncio_titulo: "Criação de sites e landing pages", prestador: "Ana Melo", valor: 200, status: "CONCLUIDO", criado_em: "20/05/2026", avaliado: false },
  { id: 4, anuncio_titulo: "Ilustrações e identidade visual", prestador: "Larissa Pereira", valor: 150, status: "CANCELADO", criado_em: "15/05/2026" },
];

function Stars({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="stars-input">
      {[1,2,3,4,5].map(i => (
        <button
          key={i}
          type="button"
          className={`star-btn${i <= (hover || value) ? " ativa" : ""}`}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
        >★</button>
      ))}
    </div>
  );
}

export default function MeusContratos() {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [avaliacaoAberta, setAvaliacaoAberta] = useState(null);
  const [nota, setNota] = useState(0);

  useEffect(() => {
    // reativar dps de integrar login
    // if (!estaLogado()) { navigate("/login"); return; }

    listarContratos()
      .then(data => setContratos(data))
      .catch(() => setContratos(CONTRATOS_MOCK))
      .finally(() => setCarregando(false));
  }, []);

  async function handleCancelar(id) {
    try {
      await atualizarContrato(id, "CANCELADO");
      setContratos(contratos.map(c => c.id === id ? { ...c, status: "CANCELADO" } : c));
    } catch {
      setContratos(contratos.map(c => c.id === id ? { ...c, status: "CANCELADO" } : c));
    }
  }

  async function handleAvaliar(contrato_id) {
    if (nota === 0) return;
    try {
      await criarAvaliacao({ contrato_id, nota });
      setContratos(contratos.map(c => c.id === contrato_id ? { ...c, avaliado: true } : c));
    } catch {
      setContratos(contratos.map(c => c.id === contrato_id ? { ...c, avaliado: true } : c));
    }
    setAvaliacaoAberta(null);
    setNota(0);
  }

  const ativos = contratos.filter(c => ["PENDENTE", "ATIVO"].includes(c.status));
  const historico = contratos.filter(c => ["CONCLUIDO", "CANCELADO"].includes(c.status));

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
        {carregando ? (
          <div className="contratos-centro">
            <div className="loading-spinner" />
            <p>Carregando contratos...</p>
          </div>
        ) : contratos.length === 0 ? (
          <div className="contratos-centro">
            <p className="contratos-vazio-titulo">Nenhum contrato ainda</p>
            <p className="contratos-vazio-sub">Encontre um serviço e solicite!</p>
            <button className="btn-explorar" onClick={() => navigate("/")}>Explorar serviços</button>
          </div>
        ) : (
          <>
            {ativos.length > 0 && (
              <div className="contratos-secao">
                <p className="secao-label">Em andamento</p>
                <div className="contratos-lista">
                  {ativos.map(c => {
                    const cfg = STATUS_CONFIG[c.status];
                    return (
                      <div key={c.id} className="contrato-card">
                        <div className="contrato-top">
                          <span className="contrato-status" style={{ background: cfg.bg, color: cfg.cor }}>{cfg.label}</span>
                          <span className="contrato-valor">R$ {c.valor}</span>
                        </div>
                        <p className="contrato-titulo">{c.anuncio_titulo}</p>
                        <p className="contrato-prestador">Prestador: {c.prestador}</p>
                        <p className="contrato-data">Solicitado em {c.criado_em}</p>
                        {c.status === "PENDENTE" && (
                          <button className="btn-cancelar" onClick={() => handleCancelar(c.id)}>
                            Cancelar solicitação
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {historico.length > 0 && (
              <div className="contratos-secao">
                <p className="secao-label">Histórico</p>
                <div className="contratos-lista">
                  {historico.map(c => {
                    const cfg = STATUS_CONFIG[c.status];
                    return (
                      <div key={c.id} className="contrato-card">
                        <div className="contrato-top">
                          <span className="contrato-status" style={{ background: cfg.bg, color: cfg.cor }}>{cfg.label}</span>
                          <span className="contrato-valor">R$ {c.valor}</span>
                        </div>
                        <p className="contrato-titulo">{c.anuncio_titulo}</p>
                        <p className="contrato-prestador">Prestador: {c.prestador}</p>
                        <p className="contrato-data">Solicitado em {c.criado_em}</p>

                        {c.status === "CONCLUIDO" && !c.avaliado && (
                          avaliacaoAberta === c.id ? (
                            <div className="avaliacao-inline">
                              <p className="avaliacao-inline-label">Sua nota:</p>
                              <Stars value={nota} onChange={setNota} />
                              <div className="avaliacao-inline-btns">
                                <button className="btn-avaliar-confirmar" onClick={() => handleAvaliar(c.id)} disabled={nota === 0}>
                                  Confirmar
                                </button>
                                <button className="btn-avaliar-cancelar" onClick={() => { setAvaliacaoAberta(null); setNota(0); }}>
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button className="btn-avaliar" onClick={() => setAvaliacaoAberta(c.id)}>
                              ★ Avaliar serviço
                            </button>
                          )
                        )}

                        {c.status === "CONCLUIDO" && c.avaliado && (
                          <p className="avaliado-tag">✓ Avaliado</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
