import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  buscarAnuncio, buscarUsuario, buscarCategoria, criarContrato,
  deletarAnuncio, listarAvaliacoes, estaLogado, meuId
} from "../services/api";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import ListaAvaliacoes from "../components/ListaAvaliacoes";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import "./DetalheAnuncio.css";

function iniciais(nome) {
  if (!nome) return "?";
  return nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

const LABELS_NOTA = ["", "Ruim", "Regular", "Bom", "Ótimo", "Excelente"];

export default function DetalheAnuncio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [anuncio, setAnuncio] = useState(null);
  const [prestador, setPrestador] = useState(null);
  const [categoria, setCategoria] = useState(null);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [solicitado, setSolicitado] = useState(false);
  const [solicitando, setSolicitando] = useState(false);
  const [confirmarDelete, setConfirmarDelete] = useState(false);
  const [modalSolicitar, setModalSolicitar] = useState(false);

  const logado = estaLogado();
  const idUsuario = meuId() ? Number(meuId()) : null;

  useEffect(() => {
    buscarAnuncio(id)
      .then(async (a) => {
        setAnuncio(a);
        try {
          const u = await buscarUsuario(a.prestador_id);
          setPrestador(u);
        } catch {}
        try {
          const cat = await buscarCategoria(a.categoria_id);
          setCategoria(cat);
        } catch {}
        try {
          const avs = await listarAvaliacoes(a.id);
          setAvaliacoes(Array.isArray(avs) ? avs : []);
        } catch {
          setAvaliacoes([]);
        }
      })
      .catch(() => navigate("/"))
      .finally(() => setCarregando(false));
  }, [id]);

  async function handleSolicitar() {
    if (!logado) { navigate("/login"); return; }
    setSolicitando(true);
    try {
      await criarContrato({
        anuncio_id: anuncio.id,
        prestador_id: anuncio.prestador_id,
        valor_fechado: anuncio.preco,
      });
      setSolicitado(true);
      toast("Serviço solicitado com sucesso!", "sucesso");
    } catch (err) {
      toast(err?.erro || "Erro ao solicitar serviço.", "erro");
    } finally {
      setSolicitando(false);
      setModalSolicitar(false);
    }
  }

  async function handleDeletar() {
    try {
      await deletarAnuncio(anuncio.id);
      toast("Anúncio deletado.", "info");
      navigate("/");
    } catch {
      toast("Erro ao deletar anúncio.", "erro");
    }
  }

  function abrirWhatsApp() {
    if (!prestador?.numero) {
      toast("Prestador não informou telefone.", "erro");
      return;
    }
    const num = String(prestador.numero).replace(/\D/g, "");
    window.open(`https://wa.me/55${num}`, "_blank");
  }

  if (carregando) return <div className="detalhe-root"><Navbar /><Loading texto="Carregando anúncio..." /></div>;
  if (!anuncio) return null;

  const ehDono = idUsuario && idUsuario === anuncio.prestador_id;
  const nomeExibido = anuncio.prestador_nome || prestador?.nome || `Prestador #${anuncio.prestador_id}`;
  const localExibido = prestador
    ? [prestador.bairro, prestador.cidade].filter(Boolean).join(", ") || "Localização não informada"
    : "";

  return (
    <div className="detalhe-root">
      <Navbar />

      <div className="detalhe-body">
        <button className="detalhe-back" onClick={() => navigate(-1)}>← Voltar</button>

        <div className="detalhe-card">
          <div className="detalhe-top">
            <span className="detalhe-cat" style={{ background: "#FFF5ED", color: "#C45A10" }}>
              {categoria?.nome || `Cat. ${anuncio.categoria_id}`}
            </span>
            <div style={{ textAlign: "right" }}>
              <div className="detalhe-preco">R$ {Number(anuncio.preco).toFixed(2)}</div>
              <div className="detalhe-tipo">por serviço</div>
            </div>
          </div>

          <h1 className="detalhe-titulo">{anuncio.titulo}</h1>
          <div className="detalhe-divider" />

          <div className="detalhe-section">
            <span className="detalhe-section-label">Descrição</span>
            <p className="detalhe-desc">{anuncio.descricao}</p>
          </div>

          <div className="detalhe-divider" />

          <div className="detalhe-section">
            <span className="detalhe-section-label">Prestador</span>
            <div className="detalhe-prestador">
              <div className="detalhe-avatar">{iniciais(nomeExibido)}</div>
              <div>
                <div className="prestador-nome">{nomeExibido}</div>
                {localExibido && <div className="prestador-local">📍 {localExibido}</div>}
              </div>
            </div>
          </div>

          {ehDono ? (
            <div className="detalhe-acoes">
              {!confirmarDelete ? (
                <>
                  <button className="btn-editar" onClick={() => navigate(`/editar-anuncio/${anuncio.id}`)}>
                    Editar anúncio
                  </button>
                  <button className="btn-deletar" onClick={() => setConfirmarDelete(true)}>
                    Deletar
                  </button>
                </>
              ) : (
                <div className="confirm-row">
                  <span className="confirm-texto">Tem certeza?</span>
                  <button className="btn-sim" onClick={handleDeletar}>Sim, deletar</button>
                  <button className="btn-nao" onClick={() => setConfirmarDelete(false)}>Cancelar</button>
                </div>
              )}
            </div>
          ) : solicitado ? (
            <div className="solicitado-card">
              <div className="solicitado-icon">✓</div>
              <div>
                <div className="solicitado-titulo">Serviço solicitado!</div>
                <div className="solicitado-sub">Acompanhe em Meus Contratos</div>
              </div>
              <button className="btn-ver-contratos" onClick={() => navigate("/meus-contratos")}>
                Ver contratos
              </button>
            </div>
          ) : (
            <div className="detalhe-contato-row">
              <button
                className="btn-contato"
                onClick={() => logado ? setModalSolicitar(true) : navigate("/login")}
                disabled={solicitando}
              >
                {solicitando ? <span className="spinner-btn" /> : "Solicitar serviço"}
              </button>
              {prestador?.numero && <button className="btn-whatsapp" onClick={abrirWhatsApp}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>}
            </div>
          )}
        </div>

        <div className="avaliacao-card">
          <div className="avaliacao-titulo">Avaliações do serviço</div>
          <div className="avaliacao-sub">Opiniões de quem já contratou</div>
          <ListaAvaliacoes avaliacoes={avaliacoes} />
        </div>
      </div>

      <Modal
        aberto={modalSolicitar}
        titulo="Solicitar serviço"
        mensagem={`Deseja solicitar "${anuncio.titulo}" por R$ ${Number(anuncio.preco).toFixed(2)}?`}
        textoConfirmar="Sim, solicitar"
        onConfirmar={handleSolicitar}
        onCancelar={() => setModalSolicitar(false)}
      />
    </div>
  );
}
