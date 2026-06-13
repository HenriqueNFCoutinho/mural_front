import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  listarContratos, atualizarContrato, criarAvaliacao,
  listarAvaliacoes as listarTodasAvaliacoes, estaLogado, meuId
} from "../services/api";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import "./MeusContratos.css";

const STATUS_CONFIG = {
  pendente:  { label: "Pendente",   cor: "#E8A020", bg: "#FFF8E0" },
  ativo:     { label: "Ativo",      cor: "#1D9E75", bg: "#E1F5EE" },
  concluido: { label: "Concluído",  cor: "#3B5FCC", bg: "#EAF0FF" },
  cancelado: { label: "Cancelado",  cor: "#C0392B", bg: "#FDE8E8" },
  restrito:  { label: "Restrito",   cor: "#888",    bg: "#F0F0F0" },
};

function StarsAvaliar({ nota, setNota }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="aval-stars">
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button"
          className={`aval-star${i <= (hover || nota) ? " ativa" : ""}`}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => setNota(i)}>★</button>
      ))}
    </div>
  );
}

function StarsExibir({ nota }) {
  return (
    <div className="aval-stars-exibir">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`aval-star-mini${i <= nota ? " ativa" : ""}`}>★</span>
      ))}
    </div>
  );
}

export default function MeusContratos() {
  const navigate = useNavigate();
  const toast = useToast();
  const [contratos, setContratos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [avaliando, setAvaliando] = useState(null);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");

  // modais de confirmação: { id, acao, titulo, mensagem }
  const [modal, setModal] = useState(null);

  const usuarioId = Number(meuId()) || 0;

  useEffect(() => {
    if (!estaLogado()) { navigate("/login"); return; }
    Promise.all([listarContratos(), listarTodasAvaliacoes()])
      .then(([data, todasAvs]) => {
        const lista = Array.isArray(data) ? data : [];
        const avs   = Array.isArray(todasAvs) ? todasAvs : [];
        const comAvaliacoes = lista.map(c => {
          if (c.status === "concluido") {
            const av = avs.find(a => a.contrato_id === c.id);
            if (av) return { ...c, avaliado: true, avaliacao: av };
          }
          return c;
        });
        setContratos(comAvaliacoes);
      })
      .catch(() => setContratos([]))
      .finally(() => setCarregando(false));
  }, []);

  async function mudarStatus(id, novoStatus) {
    try {
      await atualizarContrato(id, novoStatus);
      setContratos(prev => prev.map(c => c.id === id ? { ...c, status: novoStatus } : c));
      const msgs = {
        cancelado: "Contrato cancelado.",
        ativo:     "Serviço aceito! Contrato ativo.",
        concluido: "Serviço marcado como concluído!",
      };
      toast(msgs[novoStatus] || "Status atualizado.", novoStatus === "cancelado" ? "info" : "sucesso");
    } catch (err) {
      toast(err?.erro || "Erro ao atualizar contrato.", "erro");
    }
    setModal(null);
  }

  function confirmar(id, acao) {
    const configs = {
      aceitar:   { titulo: "Aceitar serviço",       mensagem: "Confirma que deseja aceitar este serviço?",                          novoStatus: "ativo"     },
      recusar:   { titulo: "Recusar serviço",        mensagem: "Tem certeza que deseja recusar esta solicitação?",                   novoStatus: "cancelado" },
      cancelar:  { titulo: "Cancelar solicitação",   mensagem: "Tem certeza que deseja cancelar este contrato?",                     novoStatus: "cancelado" },
      concluir:  { titulo: "Concluir serviço",       mensagem: "Confirma que o serviço foi realizado e deseja marcá-lo como concluído?", novoStatus: "concluido" },
    };
    setModal({ id, ...configs[acao] });
  }

  async function handleAvaliar(contratoId) {
    if (nota === 0) return;
    try {
      await criarAvaliacao({ contrato_id: contratoId, nota, comentario });
      toast("Avaliação enviada!", "sucesso");
      setContratos(prev => prev.map(c =>
        c.id === contratoId ? { ...c, avaliado: true, avaliacao: { nota, comentario } } : c
      ));
      setAvaliando(null);
      setNota(0);
      setComentario("");
    } catch (err) {
      toast(err?.erro || "Erro ao enviar avaliação.", "erro");
    }
  }

  const emAndamento = contratos.filter(c => ["pendente", "ativo"].includes(c.status));
  const historico   = contratos.filter(c => ["concluido", "cancelado", "restrito"].includes(c.status));

  function renderContrato(c, mostrarAvaliacao) {
    const cfg        = STATUS_CONFIG[c.status] || STATUS_CONFIG.pendente;
    const ehPrestador = Number(c.prestador_id) === usuarioId;
    const ehCliente   = Number(c.cliente_id)   === usuarioId;

    return (
      <div key={c.id} className="contrato-card">
        <div className="contrato-top">
          <span className="contrato-status" style={{ background: cfg.bg, color: cfg.cor }}>{cfg.label}</span>
          <span className="contrato-valor">R$ {Number(c.valor_fechado).toFixed(2)}</span>
        </div>

        <p className="contrato-titulo">Contrato #{c.id}</p>
        <p className="contrato-prestador">
          {ehPrestador ? `Cliente: #${c.cliente_id}` : `Prestador: #${c.prestador_id}`}
        </p>
        <p className="contrato-data">
          {c.assinado_em ? new Date(c.assinado_em).toLocaleDateString("pt-BR") : "—"}
        </p>

        {/* ── ações do PRESTADOR em PENDENTE ── */}
        {c.status === "pendente" && ehPrestador && (
          <div className="contrato-acoes">
            <button className="btn-aceitar"  onClick={() => confirmar(c.id, "aceitar")}>Aceitar serviço</button>
            <button className="btn-cancelar" onClick={() => confirmar(c.id, "recusar")}>Recusar</button>
          </div>
        )}

        {/* ── ação do CLIENTE em PENDENTE ── */}
        {c.status === "pendente" && ehCliente && (
          <button className="btn-cancelar" onClick={() => confirmar(c.id, "cancelar")}>Cancelar solicitação</button>
        )}

        {/* ── ação do PRESTADOR em ATIVO ── */}
        {c.status === "ativo" && ehPrestador && (
          <button className="btn-concluir" onClick={() => confirmar(c.id, "concluir")}>Marcar como concluído</button>
        )}

        {/* ── avaliação do CLIENTE após concluído ── */}
        {mostrarAvaliacao && c.status === "concluido" && ehCliente && !c.avaliado && (
          avaliando === c.id ? (
            <div className="aval-box">
              <p className="aval-label">Avalie este serviço:</p>
              <StarsAvaliar nota={nota} setNota={setNota} />
              <textarea className="aval-coment" placeholder="Escreva um comentário (opcional)..."
                value={comentario} onChange={e => setComentario(e.target.value)} maxLength={300} />
              <div className="avaliacao-inline-btns">
                <button className="btn-avaliar-confirmar" onClick={() => handleAvaliar(c.id)} disabled={nota === 0}>Enviar</button>
                <button className="btn-avaliar-cancelar"  onClick={() => { setAvaliando(null); setNota(0); setComentario(""); }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <button className="btn-avaliar" onClick={() => setAvaliando(c.id)}>Avaliar serviço</button>
          )
        )}

        {mostrarAvaliacao && c.status === "concluido" && ehCliente && c.avaliado && (
          <div className="aval-feita">
            <div className="aval-feita-top">
              <span className="aval-feita-label">Sua avaliação</span>
              <StarsExibir nota={c.avaliacao?.nota || 0} />
            </div>
            {c.avaliacao?.comentario && (
              <p className="aval-feita-coment">"{c.avaliacao.comentario}"</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="contratos-root">
      <Navbar />
      <div className="contratos-body">
        {carregando ? (
          <Loading texto="Carregando contratos..." />
        ) : contratos.length === 0 ? (
          <div className="contratos-centro">
            <p className="contratos-vazio-titulo">Nenhum contrato ainda</p>
            <p className="contratos-vazio-sub">Solicite um serviço para criar um contrato!</p>
            <button className="btn-explorar" onClick={() => navigate("/")}>Explorar serviços</button>
          </div>
        ) : (
          <>
            {emAndamento.length > 0 && (
              <div className="contratos-secao">
                <p className="secao-label">Em andamento</p>
                <div className="contratos-lista">
                  {emAndamento.map(c => renderContrato(c, false))}
                </div>
              </div>
            )}
            {historico.length > 0 && (
              <div className="contratos-secao">
                <p className="secao-label">Histórico</p>
                <div className="contratos-lista">
                  {historico.map(c => renderContrato(c, true))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {modal && (
        <Modal
          aberto={true}
          titulo={modal.titulo}
          mensagem={modal.mensagem}
          textoConfirmar="Confirmar"
          perigo={modal.novoStatus === "cancelado"}
          onConfirmar={() => mudarStatus(modal.id, modal.novoStatus)}
          onCancelar={() => setModal(null)}
        />
      )}
    </div>
  );
}
