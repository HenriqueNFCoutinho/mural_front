import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listarAnuncios } from "../services/api";
import "./Home.css";

const CATEGORIAS = [
  { id: null, label: "Todos" },
  { id: 1, label: "Monitoria" },
  { id: 2, label: "Reparos" },
  { id: 3, label: "Tecnologia" },
  { id: 4, label: "Arte & Design" },
  { id: 5, label: "Entregas" },
  { id: 6, label: "Jardinagem" },
];

const ANUNCIOS_MOCK = [
  { id: 1, titulo: "Monitoria de Cálculo I e II", descricao: "Aluno de eng. civil, 2 anos de experiência. Resolução de exercícios e provas anteriores.", preco: 35, tipo_preco: "hora", categoria_id: 1, categoria: "Monitoria", prestador: "Rafael B.", bairro: "Centro", avaliacao: 4.9 },
  { id: 2, titulo: "Instalação elétrica e tomadas", descricao: "Serviços residenciais, troca de lâmpadas, disjuntores e instalação de ar-condicionado.", preco: 60, tipo_preco: "hora", categoria_id: 2, categoria: "Reparos", prestador: "Jonas S.", bairro: "Jardim", avaliacao: 4.7 },
  { id: 3, titulo: "Criação de sites e landing pages", descricao: "HTML, CSS e React. Entrego em até 5 dias. Portfolio disponível para consulta.", preco: 200, tipo_preco: "projeto", categoria_id: 3, categoria: "Tecnologia", prestador: "Ana M.", bairro: "Vila Nova", avaliacao: 5.0 },
  { id: 4, titulo: "Ilustrações e identidade visual", descricao: "Logotipos, banners e artes para redes sociais. Entrega em arquivo editável.", preco: 150, tipo_preco: "projeto", categoria_id: 4, categoria: "Arte & Design", prestador: "Larissa P.", bairro: "Centro", avaliacao: 4.8 },
  { id: 5, titulo: "Entrega de documentos e encomendas", descricao: "Moto disponível, atendo toda a cidade. Rápido e confiável.", preco: 15, tipo_preco: "entrega", categoria_id: 5, categoria: "Entregas", prestador: "Carlos M.", bairro: "Cohab", avaliacao: 4.6 },
  { id: 6, titulo: "Manutenção de jardins e gramados", descricao: "Corte, poda e limpeza. Atendo residências e condomínios.", preco: 80, tipo_preco: "visita", categoria_id: 6, categoria: "Jardinagem", prestador: "Seu Zé", bairro: "Boa Vista", avaliacao: 4.9 },
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

function Stars({ value }) {
  return (
    <div className="card-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(value) ? "#E8A020" : "#DDD", fontSize: 14 }}>★</span>
      ))}
      <span className="card-media">{value?.toFixed(1)}</span>
    </div>
  );
}

export default function Home() {
  const [anuncios, setAnuncios] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState(null);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    listarAnuncios()
      .then(res => setAnuncios(res.data))
      .catch(() => setAnuncios(ANUNCIOS_MOCK))
      .finally(() => setCarregando(false));
  }, []);

  const filtrados = anuncios.filter(a => {
    const matchCat = categoriaAtiva === null || a.categoria_id === categoriaAtiva;
    const matchBusca = a.titulo.toLowerCase().includes(busca.toLowerCase()) ||
                       a.descricao.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  return (
    <div className="home-root">

      <header className="home-nav">
        <span className="home-logo">Faz Tudo</span>
        <div className="home-nav-actions">
          <button className="nav-link" onClick={() => navigate("/meus-contratos")}>Meus contratos</button>
          <button className="nav-link" onClick={() => navigate("/login")}>Entrar</button>
          <button className="nav-btn-primary" onClick={() => navigate("/criar-anuncio")}>+ Anunciar</button>
        </div>
      </header>

      <section className="home-hero">
        <h1 className="hero-title">Serviços perto de você,<br />de quem você já conhece</h1>
        <p className="hero-sub">Encontre bicos, monitorias e pequenos reparos na sua vizinhança.</p>
        <div className="hero-search">
          <svg className="search-icon" viewBox="0 0 20 20" fill="none">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="#B4A090" strokeWidth="1.5"/>
            <path d="M13 13l3 3" stroke="#B4A090" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            type="text"
            placeholder="O que você precisa? Ex: aula de inglês..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
      </section>

      <div className="cat-scroll">
        {CATEGORIAS.map(c => (
          <button
            key={c.id}
            className={`cat-pill${categoriaAtiva === c.id ? " active" : ""}`}
            onClick={() => setCategoriaAtiva(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      <main className="home-main">
        {carregando ? (
          <div className="estado-centro">
            <div className="loading-spinner" />
            <p>Carregando anúncios...</p>
          </div>
        ) : erro ? (
          <div className="estado-centro">
            <p className="erro-msg">{erro}</p>
          </div>
        ) : (
          <>
            <p className="result-count">
              {filtrados.length} anúncio{filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}
            </p>

            {filtrados.length === 0 ? (
              <div className="empty-state">
                <p className="empty-title">Nenhum anúncio encontrado</p>
                <p className="empty-sub">Tente outra categoria ou termo de busca</p>
              </div>
            ) : (
              <div className="cards-grid">
                {filtrados.map(a => {
                  const cor = CORES_CAT[a.categoria] || { bg: "#F0EDE8", txt: "#5A4A3A" };
                  return (
                    <article key={a.id} className="card" onClick={() => navigate(`/anuncio/${a.id}`)}>
                      <div className="card-top">
                        <span className="card-cat-badge" style={{ background: cor.bg, color: cor.txt }}>
                          {a.categoria}
                        </span>
                        <span className="card-preco">
                          R$ {a.preco}
                          <span className="card-preco-tipo">/{a.tipo_preco}</span>
                        </span>
                      </div>
                      <h2 className="card-titulo">{a.titulo}</h2>
                      <p className="card-desc">{a.descricao}</p>
                      <div className="card-footer">
                        <div className="card-author">
                          <div className="avatar">{iniciais(a.prestador || "U")}</div>
                          <div>
                            <p className="author-nome">{a.prestador}</p>
                            <p className="author-bairro">{a.bairro}</p>
                          </div>
                        </div>
                        {a.avaliacao && <Stars value={a.avaliacao} />}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
