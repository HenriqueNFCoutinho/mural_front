import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { buscarAnuncio, criarContrato, deletarAnuncio, listarAvaliacoes, estaLogado } from "../services/api";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import ListaAvaliacoes from "../components/ListaAvaliacoes";
import { useToast } from "../components/Toast";
import "./DetalheAnuncio.css";

const ANUNCIOS_MOCK = {
  1: { id: 1, prestador_id: 2, prestador_nome: "Rafael Batista", telefone: "83999990001", categoria_id: 1, titulo: "Monitoria de Calculo I", descricao: "Ajudo com limites, derivadas e integrais. Aulas presenciais ou online, material incluso.", preco: 35, status: "ativo" },
  2: { id: 2, prestador_id: 3, prestador_nome: "Ana Melo", telefone: "83999990002", categoria_id: 2, titulo: "Reparos eletricos residenciais", descricao: "Tomadas, chuveiros, disjuntores. Atendimento rapido na sua casa.", preco: 80, status: "ativo" },
  3: { id: 3, prestador_id: 4, prestador_nome: "Jonas Silva", telefone: "83999990003", categoria_id: 3, titulo: "Criacao de sites e landing pages", descricao: "Desenvolvo sites modernos e responsivos para o seu negocio.", preco: 350, status: "ativo" },
};

const AVALIACOES_MOCK = [
  { id: 1, nota: 5, comentario: "Profissional excelente, super pontual!", criado_em: "2026-05-15" },
  { id: 2, nota: 4, comentario: "Bom servico, recomendo.", criado_em: "2026-05-10" },
];

export default function DetalheAnuncio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [anuncio, setAnuncio] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [modalRemover, setModalRemover] = useState(false);
  const [solicitando, setSolicitando] = useState(false);
  const [solicitado, setSolicitado] = useState(false);

  useEffect(() => {
    buscarAnuncio(id)
      .then(data => setAnuncio(data))
      .catch(() => setAnuncio(ANUNCIOS_MOCK[id] || ANUNCIOS_MOCK[1]))
      .finally(() => setCarregando(false));

    listarAvaliacoes(id)
      .then(data => setAvaliacoes(Array.isArray(data) && data.length ? data : AVALIACOES_MOCK))
      .catch(() => setAvaliacoes(AVALIACOES_MOCK));
  }, [id]);

  async function handleDeletar() {
    try { await deletarAnuncio(id); } catch {}
    toast("Anuncio removido.", "info");
    navigate("/");
  }

  async function handleSolicitar() {
    if (!estaLogado()) { navigate("/login"); return; }
    setSolicitando(true);
    try {
      await criarContrato({
        prestador_id: anuncio.prestador_id,
        anuncio_id: anuncio.id,
        valor_fechado: anuncio.preco,
      });
    } catch {}
    toast("Servico solicitado!", "sucesso");
    setSolicitado(true);
    setSolicitando(false);
  }

  function abrirWhatsApp() {
    const tel = anuncio.telefone?.replace(/\D/g, "");
    if (!tel) { toast("Telefone nao disponivel.", "erro"); return; }
    const msg = encodeURIComponent(`Ola! Vi seu anuncio "${anuncio.titulo}" no Faz Tudo e tenho interesse.`);
    window.open(`https://wa.me/55${tel}?text=${msg}`, "_blank");
  }

  if (carregando) return <div className="detalhe-root"><Navbar /><Loading /></div>;
  if (!anuncio) return <div className="detalhe-root"><Navbar /><div className="detalhe-notfound"><p>Anuncio nao encontrado.</p></div></div>;

  return (
    <div className="detalhe-root">
      <Navbar />
      <div className="detalhe-body">
        <button className="detalhe-back" onClick={() => navigate("/")}>← Voltar ao mural</button>

        <div className="detalhe-card">
          <div className="detalhe-top">
            <span className="detalhe-cat">Categoria #{anuncio.categoria_id}</span>
            <span className="detalhe-preco">R$ {Number(anuncio.preco).toFixed(2)}</span>
          </div>
          <h1 className="detalhe-titulo">{anuncio.titulo}</h1>
          <div className="detalhe-divider" />
          <div className="detalhe-section">
            <p className="detalhe-section-label">Sobre o servico</p>
            <p className="detalhe-desc">{anuncio.descricao}</p>
          </div>
          <div className="detalhe-divider" />
          <div className="detalhe-info-row">
            <div className="info-item">
              <p className="info-label">Preco</p>
              <p className="info-valor">R$ {Number(anuncio.preco).toFixed(2)}</p>
            </div>
            <div className="info-item">
              <p className="info-label">Status</p>
              <p className="info-valor">{anuncio.status}</p>
            </div>
            <div className="info-item">
              <p className="info-label">Prestador</p>
              <p className="info-valor">{anuncio.prestador_nome || `#${anuncio.prestador_id}`}</p>
            </div>
          </div>
        </div>

        <div className="detalhe-acoes">
          <button className="btn-editar" onClick={() => navigate(`/editar-anuncio/${anuncio.id}`)}>Editar anuncio</button>
          <button className="btn-deletar" onClick={() => setModalRemover(true)}>Remover</button>
        </div>

        {solicitado ? (
          <div className="solicitado-card">
            <span className="solicitado-icon">✓</span>
            <div>
              <p className="solicitado-titulo">Servico solicitado!</p>
              <p className="solicitado-sub">Acompanhe em Meus Contratos</p>
            </div>
            <button className="btn-ver-contratos" onClick={() => navigate("/meus-contratos")}>Ver contratos</button>
          </div>
        ) : (
          <div className="detalhe-contato-row">
            <button className="btn-contato" onClick={handleSolicitar} disabled={solicitando}>
              {solicitando ? "Solicitando..." : "Solicitar servico"}
            </button>
            <button className="btn-whatsapp" onClick={abrirWhatsApp}>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                <path d="M17.5 14.4c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.3 5.2 4.6 2 .8 2.7.9 3.7.8.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z"/>
                <path d="M12 2a10 10 0 00-8.5 15.2L2 22l4.9-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1112 20z"/>
              </svg>
              Chamar no WhatsApp
            </button>
          </div>
        )}

        <div className="detalhe-section">
          <p className="detalhe-section-label">Avaliacoes</p>
          <ListaAvaliacoes avaliacoes={avaliacoes} />
        </div>
      </div>

      <Modal
        aberto={modalRemover}
        titulo="Remover anuncio"
        mensagem="Tem certeza que deseja remover este anuncio? Esta acao nao pode ser desfeita."
        textoConfirmar="Sim, remover"
        perigo
        onConfirmar={handleDeletar}
        onCancelar={() => setModalRemover(false)}
      />
    </div>
  );
}
