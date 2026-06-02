import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { deletarAnuncio, criarContrato, estaLogado, usuarioAtual } from "../services/api";
import "./DetalheAnuncio.css";

// Mockado — trocar por chamada a API depois
const ANUNCIOS_MOCK = [
  { id: 1, titulo: "Monitoria de Cálculo I e II", descricao: "Aluno de eng. civil com 2 anos de experiência em monitoria. Resolução de exercícios, listas e provas anteriores. Aulas online ou presenciais no campus. Atendo alunos de todos os níveis, do básico ao avançado.", preco: 35, tipo_preco: "hora", categoria: "Monitoria", prestador: "Rafael Batista", bairro: "Centro", cidade: "Cajazeiras", criado_em: "Jan 2024" },
  { id: 2, titulo: "Instalação elétrica e tomadas", descricao: "Serviços residenciais completos: troca de lâmpadas, disjuntores, tomadas e instalação de ar-condicionado. Trabalho com segurança e materiais de qualidade.", preco: 60, tipo_preco: "hora", categoria: "Reparos", prestador: "Jonas Silva", bairro: "Jardim", cidade: "Cajazeiras", criado_em: "Mar 2024" },
  { id: 3, titulo: "Criação de sites e landing pages", descricao: "Desenvolvimento de sites modernos com HTML, CSS e React. Entrego em até 5 dias com design responsivo. Portfolio disponível para consulta antes de fechar.", preco: 200, tipo_preco: "projeto", categoria: "Tecnologia", prestador: "Ana Melo", bairro: "Vila Nova", cidade: "Cajazeiras", criado_em: "Fev 2024" },
  { id: 4, titulo: "Ilustrações e identidade visual", descricao: "Criação de logotipos, banners e artes para redes sociais. Entrega em arquivo editável (AI, PSD). Faço revisões até a aprovação.", preco: 150, tipo_preco: "projeto", categoria: "Arte & Design", prestador: "Larissa Pereira", bairro: "Centro", cidade: "Cajazeiras", criado_em: "Abr 2024" },
  { id: 5, titulo: "Entrega de documentos e encomendas", descricao: "Moto disponível, atendo toda a cidade. Rápido, pontual e confiável. Aceito entregas avulsas ou contratos mensais.", preco: 15, tipo_preco: "entrega", categoria: "Entregas", prestador: "Carlos Mota", bairro: "Cohab", cidade: "Cajazeiras", criado_em: "Mai 2024" },
  { id: 6, titulo: "Manutenção de jardins e gramados", descricao: "Corte, poda e limpeza de jardins residenciais e condomínios. Atendo com agendamento prévio e material próprio.", preco: 80, tipo_preco: "visita", categoria: "Jardinagem", prestador: "José Santos", bairro: "Boa Vista", cidade: "Cajazeiras", criado_em: "Jun 2024" },
];

const CORES_CAT = {
  "Monitoria":     { bg: "#E8F4F0", txt: "#1D6B52" },
  "Reparos":       { bg: "#FFF1E0", txt: "#C45A10" },
  "Tecnologia":    { bg: "#EAF0FF", txt: "#3B5FCC" },
  "Arte & Design": { bg: "#FDE8F0", txt: "#A8285A" },
  "Entregas":      { bg: "#F0EAF8", txt: "#6B3BB5" },
  "Jardinagem":    { bg: "#EAF4DC", txt: "#3A7A10" },
};

function iniciais(nome) {
  return nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function DetalheAnuncio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [confirmando, setConfirmando] = useState(false);
  const [solicitando, setSolicitando] = useState(false);
  const [solicitado, setSolicitado] = useState(false);
  const [estrelas, setEstrelas] = useState(0);
  const [estrelasHover, setEstrelasHover] = useState(0);
  const [avaliado, setAvaliado] = useState(false);

  async function handleSolicitar() {
    if (!estaLogado()) { navigate("/login"); return; }
    setSolicitando(true);
    try {
      await criarContrato({ anuncio_id: anuncio.id, valor: anuncio.preco });
      setSolicitado(true);
    } catch {
      // mock: funciona mesmo sem backend
      setSolicitado(true);
    } finally {
      setSolicitando(false);
    }
  }
  const usuario = usuarioAtual();
  const anuncio = ANUNCIOS_MOCK.find(a => a.id === Number(id));
  const ehDono = usuario && anuncio && usuario.id === anuncio.prestador_id;
  const ehAdmin = usuario?.is_admin;

  async function handleDeletar() {
    // TODO: conectar ao Flask
    // await deletarAnuncio(id);
    navigate("/");
  }

  if (!anuncio) {
    return (
      <div className="detalhe-root">
        <div className="detalhe-notfound">
          <p>Anúncio não encontrado.</p>
          <button onClick={() => navigate("/")}>Voltar ao mural</button>
        </div>
      </div>
    );
  }

  const cor = CORES_CAT[anuncio.categoria] || { bg: "#F0EDE8", txt: "#5A4A3A" };

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
            <span className="detalhe-cat" style={{ background: cor.bg, color: cor.txt }}>
              {anuncio.categoria}
            </span>
            <span className="detalhe-preco">
              R$ {anuncio.preco}
              <span className="detalhe-tipo">/{anuncio.tipo_preco}</span>
            </span>
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
              <div className="detalhe-avatar">{iniciais(anuncio.prestador)}</div>
              <div>
                <p className="prestador-nome">{anuncio.prestador}</p>
                <p className="prestador-local">
                  {anuncio.bairro}, {anuncio.cidade} · Membro desde {anuncio.criado_em}
                </p>
              </div>
            </div>
          </div>

          <div className="detalhe-divider" />

          <div className="detalhe-info-row">
            <div className="info-item">
              <p className="info-label">Preço</p>
              <p className="info-valor">R$ {anuncio.preco}<span className="info-tipo">/{anuncio.tipo_preco}</span></p>
            </div>
            <div className="info-item">
              <p className="info-label">Localidade</p>
              <p className="info-valor">{anuncio.bairro}</p>
            </div>
            <div className="info-item">
              <p className="info-label">Categoria</p>
              <p className="info-valor">{anuncio.categoria}</p>
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
              <button className="btn-deletar" onClick={() => setConfirmando(true)}>
                Remover anúncio
              </button>
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
                  <button
                    key={i}
                    className={`estrela${i <= (estrelasHover || estrelas) ? " ativa" : ""}`}
                    onMouseEnter={() => setEstrelasHover(i)}
                    onMouseLeave={() => setEstrelasHover(0)}
                    onClick={() => { setEstrelas(i); setAvaliado(true); }}
                  >
                    ★
                  </button>
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

        <p className="detalhe-hint">Faça login para entrar em contato com o prestador</p>
      </div>
    </div>
  );
}
