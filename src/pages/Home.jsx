import { useState, useEffect } from "react";
import { listarAnuncios, listarCategorias } from "../services/api";
import { useDebounce } from "../components/useDebounce";
import Navbar from "../components/Navbar";
import CardAnuncio from "../components/CardAnuncio";
import { SkeletonGrid } from "../components/Skeleton";
import "./Home.css";

const ORDENACOES = [
  { value: "recentes", label: "Mais recentes" },
  { value: "preco-menor", label: "Menor preco" },
  { value: "preco-maior", label: "Maior preco" },
  { value: "avaliacao", label: "Melhor avaliados" },
];

export default function Home() {
  const [anuncios, setAnuncios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [busca, setBusca] = useState("");
  const buscaDebounced = useDebounce(busca, 400);
  const [catAtiva, setCatAtiva] = useState(null);
  const [ordem, setOrdem] = useState("recentes");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    listarAnuncios()
      .then(data => setAnuncios(Array.isArray(data) ? data : []))
      .catch(() => setAnuncios([]))
      .finally(() => setCarregando(false));

    listarCategorias()
      .then(data => setCategorias(Array.isArray(data) ? data : []))
      .catch(() => setCategorias([]));
  }, []);

  let filtrados = anuncios.filter(a => {
    const termo = buscaDebounced.toLowerCase();
    const matchBusca = a.titulo?.toLowerCase().includes(termo) ||
                       a.descricao?.toLowerCase().includes(termo);
    const matchCat = catAtiva === null || a.categoria_id === catAtiva;
    return matchBusca && matchCat;
  });

  filtrados = [...filtrados].sort((a, b) => {
    if (ordem === "preco-menor") return (a.preco || 0) - (b.preco || 0);
    if (ordem === "preco-maior") return (b.preco || 0) - (a.preco || 0);
    if (ordem === "avaliacao") return (b.media_avaliacao || 0) - (a.media_avaliacao || 0);
    return (b.id || 0) - (a.id || 0);
  });

  return (
    <div className="home-root">
      <Navbar />

      <section className="home-hero">
        <h1 className="hero-title">Servicos perto de voce,<br />de quem voce ja conhece</h1>
        <p className="hero-sub">Encontre bicos, monitorias e pequenos reparos na sua vizinhanca.</p>
        <div className="hero-search">
          <svg className="search-icon" viewBox="0 0 20 20" fill="none">
            <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M13 13l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input type="text" placeholder="O que voce precisa?"
            value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
      </section>

      <main className="home-main">
        <div className="home-filtros">
          <div className="cat-pills">
            <button className={`cat-pill${catAtiva === null ? " ativo" : ""}`}
              onClick={() => setCatAtiva(null)}>Todos</button>
            {categorias.map(c => (
              <button key={c.id} className={`cat-pill${catAtiva === c.id ? " ativo" : ""}`}
                onClick={() => setCatAtiva(c.id)}>{c.nome}</button>
            ))}
          </div>
          <select className="ordem-select" value={ordem} onChange={e => setOrdem(e.target.value)}>
            {ORDENACOES.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {carregando ? (
          <SkeletonGrid quantidade={8} />
        ) : filtrados.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title">Nenhum anuncio encontrado</p>
            <p className="empty-sub">Tente outra busca ou seja o primeiro a anunciar!</p>
          </div>
        ) : (
          <>
            <p className="result-count">{filtrados.length} anuncio{filtrados.length !== 1 ? "s" : ""}</p>
            <div className="cards-grid">
              {filtrados.map(a => <CardAnuncio key={a.id} anuncio={a} />)}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
