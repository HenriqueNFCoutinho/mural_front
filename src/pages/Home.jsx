import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listarAnuncios, estaLogado, logout } from "../services/api";
import "./Home.css";

function iniciais(nome) {
  if (!nome) return "?";
  return nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function Home() {
  const [anuncios, setAnuncios] = useState([]);
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

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const filtrados = anuncios.filter(a =>
    a.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
    a.descricao?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="home-root">
      <header className="home-nav">
        <span className="home-logo">Faz Tudo</span>
        <div className="home-nav-actions">
          {logado ? (
            <>
              <button className="nav-link" onClick={() => navigate("/meus-contratos")}>Meus contratos</button>
              <button className="nav-link" onClick={() => navigate("/admin")}>Admin</button>
              <button className="nav-link" onClick={handleLogout}>Sair</button>
              <button className="nav-btn-primary" onClick={() => navigate("/criar-anuncio")}>+ Anunciar</button>
            </>
          ) : (
            <>
              <button className="nav-link" onClick={() => navigate("/login")}>Entrar</button>
              <button className="nav-btn-primary" onClick={() => navigate("/register")}>Cadastrar</button>
            </>
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
          <input type="text" placeholder="O que você precisa?"
            value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
      </section>

      <main className="home-main">
        {carregando ? (
          <div className="estado-centro">
            <div className="loading-spinner" />
            <p>Carregando anúncios...</p>
          </div>
        ) : filtrados.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">Nenhum anúncio encontrado</p>
            <p className="empty-sub">Seja o primeiro a anunciar!</p>
          </div>
        ) : (
          <>
            <p className="result-count">{filtrados.length} anúncio{filtrados.length !== 1 ? "s" : ""}</p>
            <div className="cards-grid">
              {filtrados.map(a => (
                <article key={a.id} className="card" onClick={() => navigate(`/anuncio/${a.id}`)}>
                  <div className="card-top">
                    <span className="card-cat-badge" style={{ background: "#F0E4D4", color: "#C45A10" }}>
                      Cat. {a.categoria_id}
                    </span>
                    <span className="card-preco">R$ {Number(a.preco).toFixed(2)}</span>
                  </div>
                  <h2 className="card-titulo">{a.titulo}</h2>
                  <p className="card-desc">{a.descricao}</p>
                  <div className="card-footer">
                    <div className="card-author">
                      <div className="avatar">P{a.prestador_id}</div>
                      <p className="author-nome">Prestador #{a.prestador_id}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
