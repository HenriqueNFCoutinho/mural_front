import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listarContratos, atualizarContrato, criarAvaliacao, estaLogado } from "../services/api";
import "./MeusContratos.css";

const STATUS_CONFIG = {
  PENDENTE:  { label: "Pendente",  cor: "#E8A020", bg: "#FFF8E0" },
  ATIVO:     { label: "Ativo",     cor: "#1D9E75", bg: "#E1F5EE" },
  CONCLUIDO: { label: "Concluído", cor: "#3B5FCC", bg: "#EAF0FF" },
  CANCELADO: { label: "Cancelado", cor: "#C0392B", bg: "#FDE8E8" },
};

function Stars({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="stars-input">
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button"
          className={`star-btn${i <= (hover || value) ? " ativa" : ""}`}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}>★</button>
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
    if (!estaLogado()) { navigate("/login"); return; }
    listarContratos()
      .then(data => setContratos(Array.isArray(data) ? data : []))
      .catch(() => setContratos([]))
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
    } catch {}
    setContratos(contratos.map(c => c.id === contrato_id ? { ...c, avaliado: true } : c));
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
                    const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.PENDENTE;
                    return (
                      <div key={c.id} className="contrato-card">
                        <div className="contrato-top">
                          <span className="contrato-status" style={{ background: cfg.bg, color: cfg.cor }}>{cfg.label}</span>
                          <span className="contrato-valor">R$ {Number(c.valor_fechado).toFixed(2)}</span>
                        </div>
                        <p className="contrato-titulo">Contrato #{c.id}</p>
                        <p className="contrato-prestador">Prestador: #{c.prestador_id}</p>
                        <p className="contrato-data">Criado em {c.assinado_em ? new Date(c.assinado_em).toLocaleDateString('pt-BR') : '—'}</p>
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
                    const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.CANCELADO;
                    return (
                      <div key={c.id} className="contrato-card">
                        <div className="contrato-top">
                          <span className="contrato-status" style={{ background: cfg.bg, color: cfg.cor }}>{cfg.label}</span>
                          <span className="contrato-valor">R$ {Number(c.valor_fechado).toFixed(2)}</span>
                        </div>
                        <p className="contrato-titulo">Contrato #{c.id}</p>
                        <p className="contrato-prestador">Prestador: #{c.prestador_id}</p>
                        <p className="contrato-data">Criado em {c.assinado_em ? new Date(c.assinado_em).toLocaleDateString('pt-BR') : '—'}</p>

                        {c.status === "CONCLUIDO" && !c.avaliado && (
                          avaliacaoAberta === c.id ? (
                            <div className="avaliacao-inline">
                              <p className="avaliacao-inline-label">Sua nota:</p>
                              <Stars value={nota} onChange={setNota} />
                              <div className="avaliacao-inline-btns">
                                <button className="btn-avaliar-confirmar" onClick={() => handleAvaliar(c.id)} disabled={nota === 0}>Confirmar</button>
                                <button className="btn-avaliar-cancelar" onClick={() => { setAvaliacaoAberta(null); setNota(0); }}>Cancelar</button>
                              </div>
                            </div>
                          ) : (
                            <button className="btn-avaliar" onClick={() => setAvaliacaoAberta(c.id)}>★ Avaliar serviço</button>
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
