import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listarContratos, atualizarContrato, criarAvaliacao, listarAvaliacoes as listarTodasAvaliacoes, estaLogado, meuId } from "../services/api";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import "./MeusContratos.css";


const STATUS_CONFIG = {
  pendente:  { label: "Pendente",  cor: "#E8A020", bg: "#FFF8E0" },
  ativo:     { label: "Ativo",     cor: "#1D9E75", bg: "#E1F5EE" },
  concluido: { label: "Concluido", cor: "#3B5FCC", bg: "#EAF0FF" },
  cancelado: { label: "Cancelado", cor: "#C0392B", bg: "#FDE8E8" },
  restrito:  { label: "Restrito",  cor: "#888",    bg: "#F0F0F0" },
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
  const [modalCancelar, setModalCancelar] = useState(null);
  const [modalConcluir, setModalConcluir] = useState(null);
  const [avaliando, setAvaliando] = useState(null);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const usuarioId = Number(meuId());

  useEffect(() => {
    if (!estaLogado()) { navigate("/login"); return; }
    Promise.all([listarContratos(), listarTodasAvaliacoes()])
      .then(([data, todasAvs]) => {
        const lista = Array.isArray(data) ? data : [];
        const avs = Array.isArray(todasAvs) ? todasAvs : [];
        const comAvaliacoes = lista.map((c) => {
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

  async function handleCancelar(id) {
    try {
      await atualizarContrato(id, "cancelado");
      setContratos(contratos.map(c => c.id === id ? { ...c, status: "cancelado" } : c));
      toast("Contrato cancelado.", "info");
    } catch (err) {
      toast(err?.erro || "Erro ao cancelar contrato. Tente novamente.", "erro");
    }
    setModalCancelar(null);
  }

  async function handleConcluir(id) {
    try {
      await atualizarContrato(id, "concluido");
      setContratos(contratos.map(c => c.id === id ? { ...c, status: "concluido" } : c));
      toast("Serviço marcado como concluído!", "sucesso");
    } catch (err) {
      toast(err?.erro || "Erro ao concluir contrato. Tente novamente.", "erro");
    }
    setModalConcluir(null);
  }

  async function handleAvaliar(contratoId) {
    if (nota === 0) return;
    const avaliacao = { nota, comentario };
    try {
      await criarAvaliacao({ contrato_id: contratoId, nota, comentario });
      toast("Avaliação enviada!", "sucesso");
      setContratos(contratos.map(c => c.id === contratoId ? { ...c, avaliado: true, avaliacao } : c));
      setAvaliando(null);
      setNota(0);
      setComentario("");
    } catch (err) {
      toast(err?.erro || "Erro ao enviar avaliação. Tente novamente.", "erro");
    }
  }

  const ativos = contratos.filter(c => ["pendente", "ativo"].includes(c.status));
  const historico = contratos.filter(c => ["concluido", "cancelado", "restrito"].includes(c.status));

  function renderContrato(c, mostrarAvaliacao) {
    const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.pendente;
    const ehPrestador = c.prestador_id === usuarioId;
    const ehCliente = c.cliente_id === usuarioId;

    return (
      <div key={c.id} className="contrato-card">
        <div className="contrato-top">
          <span className="contrato-status" style={{ background: cfg.bg, color: cfg.cor }}>{cfg.label}</span>
          <span className="contrato-valor">R$ {Number(c.valor_fechado).toFixed(2)}</span>
        </div>
        <p className="contrato-titulo">Contrato #{c.id}</p>
        <p className="contrato-prestador">Prestador: #{c.prestador_id}</p>
        <p className="contrato-data">{c.assinado_em ? new Date(c.assinado_em).toLocaleDateString("pt-BR") : "—"}</p>

        {c.status === "pendente" && ehCliente && (
          <button className="btn-cancelar" onClick={() => setModalCancelar(c.id)}>Cancelar solicitacao</button>
        )}

        {c.status === "ativo" && ehPrestador && (
          <button className="btn-concluir" onClick={() => setModalConcluir(c.id)}>Marcar como concluído</button>
        )}

        {mostrarAvaliacao && c.status === "concluido" && ehCliente && !c.avaliado && (
          avaliando === c.id ? (
            <div className="aval-box">
              <p className="aval-label">Avalie este servico:</p>
              <StarsAvaliar nota={nota} setNota={setNota} />
              <textarea className="aval-coment" placeholder="Escreva um comentario (opcional)..."
                value={comentario} onChange={e => setComentario(e.target.value)} maxLength={300} />
              <div className="avaliacao-inline-btns">
                <button className="btn-avaliar-confirmar" onClick={() => handleAvaliar(c.id)} disabled={nota === 0}>Enviar</button>
                <button className="btn-avaliar-cancelar" onClick={() => { setAvaliando(null); setNota(0); setComentario(""); }}>Cancelar</button>
              </div>
            </div>
          ) : (
            <button className="btn-avaliar" onClick={() => setAvaliando(c.id)}>Avaliar servico</button>
          )
        )}

        {mostrarAvaliacao && c.status === "concluido" && ehCliente && c.avaliado && (
          <div className="aval-feita">
            <div className="aval-feita-top">
              <span className="aval-feita-label">Sua avaliacao</span>
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
            <p className="contratos-vazio-sub">Solicite um servico para criar um contrato!</p>
            <button className="btn-explorar" onClick={() => navigate("/")}>Explorar servicos</button>
          </div>
        ) : (
          <>
            {ativos.length > 0 && (
              <div className="contratos-secao">
                <p className="secao-label">Em andamento</p>
                <div className="contratos-lista">
                  {ativos.map(c => renderContrato(c, false))}
                </div>
              </div>
            )}
            {historico.length > 0 && (
              <div className="contratos-secao">
                <p className="secao-label">Historico</p>
                <div className="contratos-lista">
                  {historico.map(c => renderContrato(c, true))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        aberto={modalCancelar !== null}
        titulo="Cancelar solicitacao"
        mensagem="Tem certeza que deseja cancelar este contrato? Esta acao nao pode ser desfeita."
        textoConfirmar="Sim, cancelar"
        perigo
        onConfirmar={() => handleCancelar(modalCancelar)}
        onCancelar={() => setModalCancelar(null)}
      />

      <Modal
        aberto={modalConcluir !== null}
        titulo="Concluir serviço"
        mensagem="Confirma que o serviço foi realizado e deseja marcar este contrato como concluído?"
        textoConfirmar="Sim, concluir"
        onConfirmar={() => handleConcluir(modalConcluir)}
        onCancelar={() => setModalConcluir(null)}
      />
    </div>
  );
}
