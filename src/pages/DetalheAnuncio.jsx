import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { buscarAnuncio, criarContrato, deletarAnuncio, estaLogado } from "../services/api";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import { StarsInput } from "../components/Stars";
import "./DetalheAnuncio.css";

export default function DetalheAnuncio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anuncio, setAnuncio] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [solicitando, setSolicitando] = useState(false);
  const [solicitado, setSolicitado] = useState(false);

  useEffect(() => {
    buscarAnuncio(id)
      .then(data => setAnuncio(data))
      .catch(() => navigate("/"))
      .finally(() => setCarregando(false));
  }, [id]);

  async function handleDeletar() {
    try { await deletarAnuncio(id); } catch {}
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
      setSolicitado(true);
    } catch {
      setSolicitado(true);
    } finally {
      setSolicitando(false);
    }
  }

  if (carregando) return <div className="detalhe-root"><Navbar /><Loading /></div>;

  if (!anuncio) return (
    <div className="detalhe-root">
      <Navbar />
      <div className="detalhe-notfound">
        <p>Anúncio não encontrado.</p>
        <button onClick={() => navigate("/")}>Voltar</button>
      </div>
    </div>
  );

  return (
    <div className="detalhe-root">
      <Navbar />
      <div className="detalhe-body">
        <button className="detalhe-back" onClick={() => navigate("/")}>
          ← Voltar ao mural
        </button>

        <div className="detalhe-card">
          <div className="detalhe-top">
            <span className="detalhe-cat" style={{ background: "#F0E4D4", color: "#C45A10" }}>
              Categoria #{anuncio.categoria_id}
            </span>
            <span className="detalhe-preco">R$ {Number(anuncio.preco).toFixed(2)}</span>
          </div>
          <h1 className="detalhe-titulo">{anuncio.titulo}</h1>
          <div className="detalhe-divider" />
          <div className="detalhe-section">
            <p className="detalhe-section-label">Sobre o serviço</p>
            <p className="detalhe-desc">{anuncio.descricao}</p>
          </div>
          <div className="detalhe-divider" />
          <div className="detalhe-info-row">
            <div className="info-item">
              <p className="info-label">Preço</p>
              <p className="info-valor">R$ {Number(anuncio.preco).toFixed(2)}</p>
            </div>
            <div className="info-item">
              <p className="info-label">Status</p>
              <p className="info-valor">{anuncio.status}</p>
            </div>
            <div className="info-item">
              <p className="info-label">Prestador</p>
              <p className="info-valor">#{anuncio.prestador_id}</p>
            </div>
          </div>
        </div>

        <div className="detalhe-acoes">
          <button className="btn-editar" onClick={() => navigate(`/editar-anuncio/${anuncio.id}`)}>
            Editar anúncio
          </button>
          {confirmando ? (
            <div className="confirm-row">
              <span className="confirm-texto">Tem certeza?</span>
              <button className="btn-sim" onClick={handleDeletar}>Sim</button>
              <button className="btn-nao" onClick={() => setConfirmando(false)}>Não</button>
            </div>
          ) : (
            <button className="btn-deletar" onClick={() => setConfirmando(true)}>Remover</button>
          )}
        </div>

        <StarsInput />

        {solicitado ? (
          <div className="solicitado-card">
            <span className="solicitado-icon">✓</span>
            <div>
              <p className="solicitado-titulo">Serviço solicitado!</p>
              <p className="solicitado-sub">Acompanhe em Meus Contratos</p>
            </div>
            <button className="btn-ver-contratos" onClick={() => navigate("/meus-contratos")}>
              Ver contratos
            </button>
          </div>
        ) : (
          <button className="btn-contato" onClick={handleSolicitar} disabled={solicitando}>
            {solicitando ? <span className="spinner-btn" /> : "Solicitar serviço"}
          </button>
        )}
      </div>
    </div>
  );
}
