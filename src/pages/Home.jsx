import { useState, useEffect } from "react";
import { listarAnuncios } from "../services/api";
import Navbar from "../components/Navbar";
import CardAnuncio from "../components/CardAnuncio";
import Loading from "../components/Loading";
import "./Home.css";

export default function Home() {
  const [anuncios, setAnuncios] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    listarAnuncios()
      .then(data => setAnuncios(Array.isArray(data) ? data : []))
      .catch(() => setAnuncios([]))
      .finally(() => setCarregando(false));
  }, []);

  const filtrados = anuncios.filter(a =>
    a.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
    a.descricao?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="home-root">
      <Navbar />

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
          <Loading texto="Carregando anúncios..." />
        ) : filtrados.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">Nenhum anúncio encontrado</p>
            <p className="empty-sub">Seja o primeiro a anunciar!</p>
          </div>
        ) : (
          <>
            <p className="result-count">{filtrados.length} anúncio{filtrados.length !== 1 ? "s" : ""}</p>
            <div className="cards-grid">
              {filtrados.map(a => <CardAnuncio key={a.id} anuncio={a} />)}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
