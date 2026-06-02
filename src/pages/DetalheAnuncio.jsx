import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { buscarAnuncio, criarContrato, deletarAnuncio, estaLogado, usuarioAtual } from "../services/api";
import "./DetalheAnuncio.css";

export default function DetalheAnuncio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anuncio, setAnuncio] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [confirmando, setConfirmando] = useState(false);
  const [solicitando, setSolicitando] = useState(false);
  const [solicitado, setSolicitado] = useState(false);
  const [estrelas, setEstrelas] = useState(0);
  const [estrelasHover, setEstrelasHover] = useState(0);
  const [avaliado, setAvaliado] = useState(false);

  const usuario = usuarioAtual();
  const ehDono = usuario && anuncio && usuario.id === anuncio.prestador_id;
  const ehAdmin = usuario?.perfil === "ADMIN";

  useEffect(() => {
    buscarAnuncio(id)
      .then(data => setAnuncio(data))
      .catch(() => setAnuncio(null))
      .finally(() => setCarregando(false));
  }, [id]);

  async function handleDeletar() {
    try {
      await deletarAnuncio(id);
      navigate("/");
    } catch {
      navigate("/");
    }
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

  if (carregando) return (
    <div className="detalhe-root">
      <div className="detalhe-notfound">
        <div style={{ width: 28, height: 28, border: "3px solid #EDE0D4", borderTopColor: "#C45A10", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    </div>
  );

  if (!anuncio) return (
    <div className="detalhe-root">
      <div className="detalhe-notfound">
        <p>Anúncio não encontrado.</p>
        <button onClick={() => navigate("/")}>Voltar ao mural</button>
      </div>
    </div>
  );

  return (
    <div className="detalhe-root">
      <header className="detalhe-nav">
        <button className="detalhe-back" onClick={() => navigate("/")}>
          <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
            <path d="M12 15L7 10l5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Voltar
        </button>
        <span className="detalhe-nav-title">Detalhe do anúncio</span>
        <div style={{ width: 80 }} />
      </header>

      <div className="detalhe-body">
        <div className="detalhe-card">
          <div className="detalhe-top">
            <span className="detalhe-cat" style={{ background: "#F0E4D4", color: "#C45A10" }}>
              Cat. {anuncio.categoria_id}
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

          <div className="detalhe-section">
            <p className="detalhe-section-label">Prestador</p>
            <div className="detalhe-prestador">
              <div className="detalhe-avatar">P{anuncio.prestador_id}</div>
              <div>
                <p className="prestador-nome">Prestador #{anuncio.prestador_id}</p>
                <p className="prestador-local">Status: {anuncio.status}</p>
              </div>
            </div>
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
              <p className="info-label">Categoria</p>
              <p className="info-valor">#{anuncio.categoria_id}</p>
            </div>
          </div>
        </div>

        {(ehDono || ehAdmin) && (
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
              <button className="btn-deletar" onClick={() => setConfirmando(true)}>Remover anúncio</button>
            )}
          </div>
        )}

        <div className="avaliacao-card">
          {avaliado ? (
            <div className="avaliacao-sucesso">
              <span className="avaliacao-sucesso-icon">✓</span>
              <p className="avaliacao-sucesso-texto">Obrigado pela sua avaliação!</p>
              <div className="estrelas-display">
                {[1,2,3,4,5].map(i => (
                  <span key={i} className={`estrela-display${i <= estrelas ? " ativa" : ""}`}>★</span>
                ))}
              </div>
            </div>
          ) : (
            <>
              <p className="avaliacao-titulo">Avalie este serviço</p>
              <p className="avaliacao-sub">Sua avaliação ajuda outras pessoas a encontrar bons prestadores</p>
              <div className="estrelas-row">
                {[1,2,3,4,5].map(i => (
                  <button key={i}
                    className={`estrela${i <= (estrelasHover || estrelas) ? " ativa" : ""}`}
                    onMouseEnter={() => setEstrelasHover(i)}
                    onMouseLeave={() => setEstrelasHover(0)}
                    onClick={() => { setEstrelas(i); setAvaliado(true); }}>★</button>
                ))}
              </div>
              <p className="estrelas-label">
                {estrelasHover === 1 && "Péssimo"}
                {estrelasHover === 2 && "Ruim"}
                {estrelasHover === 3 && "Regular"}
                {estrelasHover === 4 && "Bom"}
                {estrelasHover === 5 && "Excelente!"}
                {!estrelasHover && "Passe o mouse para avaliar"}
              </p>
            </>
          )}
        </div>

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

        <p className="detalhe-hint">
          {!estaLogado() && "Faça login para solicitar este serviço"}
        </p>
      </div>
    </div>
  );
}
