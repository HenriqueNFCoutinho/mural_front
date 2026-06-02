import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listarContratos, atualizarContrato, estaLogado } from "../services/api";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import "./MeusContratos.css";

const STATUS_CONFIG = {
  pendente:  { label: "Pendente",  cor: "#E8A020", bg: "#FFF8E0" },
  ativo:     { label: "Ativo",     cor: "#1D9E75", bg: "#E1F5EE" },
  concluido: { label: "Concluído", cor: "#3B5FCC", bg: "#EAF0FF" },
  cancelado: { label: "Cancelado", cor: "#C0392B", bg: "#FDE8E8" },
  restrito:  { label: "Restrito",  cor: "#888",    bg: "#F0F0F0" },
};

export default function MeusContratos() {
  const navigate = useNavigate();
  const [contratos, setContratos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [confirmando, setConfirmando] = useState(null);

  useEffect(() => {
    if (!estaLogado()) { navigate("/login"); return; }
    listarContratos()
      .then(data => setContratos(Array.isArray(data) ? data : []))
      .catch(() => setErro("Não foi possível carregar os contratos."))
      .finally(() => setCarregando(false));
  }, []);

  async function handleCancelar(id) {
    try {
      await atualizarContrato(id, "cancelado");
      setContratos(contratos.map(c => c.id === id ? { ...c, status: "cancelado" } : c));
      setConfirmando(null);
    } catch {
      setErro("Erro ao cancelar contrato.");
    }
  }

  const ativos = contratos.filter(c => ["pendente", "ativo"].includes(c.status));
  const historico = contratos.filter(c => ["concluido", "cancelado", "restrito"].includes(c.status));

  return (
    <div className="contratos-root">
      <Navbar />
      <div className="contratos-body">
        {carregando ? (
          <Loading texto="Carregando contratos..." />
        ) : erro ? (
          <div className="contratos-centro"><p style={{ color: "#C45A10" }}>{erro}</p></div>
        ) : contratos.length === 0 ? (
          <div className="contratos-centro">
            <p className="contratos-vazio-titulo">Nenhum contrato ainda</p>
            <p className="contratos-vazio-sub">Solicite um serviço para criar um contrato!</p>
            <button className="btn-explorar" onClick={() => navigate("/")}>Explorar serviços</button>
          </div>
        ) : (
          <>
            {ativos.length > 0 && (
              <div className="contratos-secao">
                <p className="secao-label">Em andamento</p>
                <div className="contratos-lista">
                  {ativos.map(c => {
                    const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.pendente;
                    return (
                      <div key={c.id} className="contrato-card">
                        <div className="contrato-top">
                          <span className="contrato-status" style={{ background: cfg.bg, color: cfg.cor }}>{cfg.label}</span>
                          <span className="contrato-valor">R$ {Number(c.valor_fechado).toFixed(2)}</span>
                        </div>
                        <p className="contrato-titulo">Contrato #{c.id}</p>
                        <p className="contrato-prestador">Prestador: #{c.prestador_id}</p>
                        <p className="contrato-data">{c.assinado_em ? new Date(c.assinado_em).toLocaleDateString("pt-BR") : "—"}</p>
                        {c.status === "pendente" && (
                          confirmando === c.id ? (
                            <div className="avaliacao-inline-btns">
                              <span style={{ fontSize: 13, color: "#7A5A3A" }}>Cancelar?</span>
                              <button className="btn-avaliar-confirmar" onClick={() => handleCancelar(c.id)}>Sim</button>
                              <button className="btn-avaliar-cancelar" onClick={() => setConfirmando(null)}>Não</button>
                            </div>
                          ) : (
                            <button className="btn-cancelar" onClick={() => setConfirmando(c.id)}>Cancelar solicitação</button>
                          )
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
                    const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.cancelado;
                    return (
                      <div key={c.id} className="contrato-card">
                        <div className="contrato-top">
                          <span className="contrato-status" style={{ background: cfg.bg, color: cfg.cor }}>{cfg.label}</span>
                          <span className="contrato-valor">R$ {Number(c.valor_fechado).toFixed(2)}</span>
                        </div>
                        <p className="contrato-titulo">Contrato #{c.id}</p>
                        <p className="contrato-prestador">Prestador: #{c.prestador_id}</p>
                        <p className="contrato-data">{c.assinado_em ? new Date(c.assinado_em).toLocaleDateString("pt-BR") : "—"}</p>
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
