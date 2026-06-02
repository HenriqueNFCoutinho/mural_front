import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listarAnuncios, estaLogado } from "../services/api";
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

const CORES_CAT = {
  1: { bg: "#E8F4F0", txt: "#1D6B52" },
  2: { bg: "#FFF1E0", txt: "#C45A10" },
  3: { bg: "#EAF0FF", txt: "#3B5FCC" },
  4: { bg: "#FDE8F0", txt: "#A8285A" },
  5: { bg: "#F0EAF8", txt: "#6B3BB5" },
  6: { bg: "#EAF4DC", txt: "#3A7A10" },
};

function iniciais(nome) {
  if (!nome) return "?";
  return nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

function Stars({ value }) {
  return (
    <div className="card-stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= Math.round(value || 0) ? "#E8A020" : "#DDD", fontSize: 14 }}>★</span>
      ))}
      {value > 0 && <span className="card-media">{Number(value).toFixed(1)}</span>}
    </div>
  );
}

export default function Home() {
  const [anuncios, setAnuncios] = useState([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState(null);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();
  const logado = estaLogado();

  useEffect(() => {
    listarAnuncios()
      .then(data => setAnuncios(Array.isArray(data) ? data : []))
      .catch(() => setAnuncios([]))
      .finally(() => setCarregando(false));
  }, []);

  const filtrados = anuncios.filter(a => {
    const matchCat = categoriaAtiva === null || a.categoria_id === categoriaAtiva;
    const matchBusca = a.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
                       a.descricao?.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  return (
    <div className="home-root">
      <header className="home-nav">
        <span className="home-logo" onClick={() => navigate("/")}>Faz Tudo</span>
        <div className="home-nav-actions">
          <button className="nav-link" onClick={() => navigate("/meus-contratos")}>Meus contratos</button>
          {logado ? (
            <button className="nav-btn-primary" onClick={() => navigate("/criar-anuncio")}>+ Anunciar</button>
          ) : (
            <button className="nav-btn-primary" onClick={() => navigate("/login")}>Entrar</button>
          )}
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
          <input type="text" placeholder="O que você precisa? Ex: aula de inglês..."
            value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
      </section>

      <div className="cat-scroll">
        {CATEGORIAS.map(c => (
          <button key={c.id} className={`cat-pill${categoriaAtiva === c.id ? " active" : ""}`}
            onClick={() => setCategoriaAtiva(c.id)}>{c.label}</button>
        ))}
      </div>

      <main className="home-main">
        {carregando ? (
          <div className="estado-centro">
            <div className="loading-spinner" />
            <p>Carregando anúncios...</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">Nenhum anúncio encontrado</p>
            <p className="empty-sub">Tente outra categoria ou termo de busca</p>
          </div>
        ) : (
          <>
            <p className="result-count">{filtrados.length} anúncio{filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}</p>
            <div className="cards-grid">
              {filtrados.map(a => {
                const cor = CORES_CAT[a.categoria_id] || { bg: "#F0EDE8", txt: "#5A4A3A" };
                return (
                  <article key={a.id} className="card" onClick={() => navigate(`/anuncio/${a.id}`)}>
                    <div className="card-top">
                      <span className="card-cat-badge" style={{ background: cor.bg, color: cor.txt }}>
                        Cat. {a.categoria_id}
                      </span>
                      <span className="card-preco">R$ {Number(a.preco).toFixed(2)}</span>
                    </div>
                    <h2 className="card-titulo">{a.titulo}</h2>
                    <p className="card-desc">{a.descricao}</p>
                    <div className="card-footer">
                      <div className="card-author">
                        <div className="avatar">{iniciais(a.prestador_nome || "U")}</div>
                        <div>
                          <p className="author-nome">{a.prestador_nome || `Prestador #${a.prestador_id}`}</p>
                        </div>
                      </div>
                      <Stars value={a.media_avaliacao || 0} />
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
