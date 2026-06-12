import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { buscarUsuario, listarAnuncios, listarCategorias, estaLogado, ehAdmin } from "../services/api";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  ResponsiveContainer, Tooltip, Legend
} from "recharts";
import "./DetalheUsuario.css";

const CORES = ["#C45A10", "#1D9E75", "#3B5FCC", "#A8285A", "#6B3BB5", "#3A7A10", "#E8A020"];



function iniciais(nome) {
  if (!nome) return "?";
  return nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function DetalheUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [anuncios, setAnuncios] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!estaLogado()) { navigate("/login"); return; }
    if (!ehAdmin()) { navigate("/"); return; }
    Promise.all([buscarUsuario(id), listarAnuncios(), listarCategorias()])
      .then(([user, todosAnuncios, cats]) => {
        setUsuario(user);
        const doUsuario = (Array.isArray(todosAnuncios) ? todosAnuncios : [])
          .filter(a => a.prestador_id === Number(id));
        setAnuncios(doUsuario);
        setCategorias(Array.isArray(cats) ? cats : []);
      })
      .catch(() => navigate("/admin"))
      .finally(() => setCarregando(false));
  }, [id]);

  if (carregando) return <div className="du-root"><Navbar /><Loading texto="Carregando perfil..." /></div>;
  if (!usuario) return null;

  const porCategoria = {};
  anuncios.forEach(a => {
    const cat = categorias.find(c => c.id === a.categoria_id);
    const nome = cat?.nome || `Cat. ${a.categoria_id}`;
    porCategoria[nome] = (porCategoria[nome] || 0) + 1;
  });
  const dadosCategoria = Object.entries(porCategoria).map(([nome, qtd]) => ({ nome, qtd }));

  const porStatus = {};
  anuncios.forEach(a => {
    porStatus[a.status] = (porStatus[a.status] || 0) + 1;
  });
  const dadosStatus = Object.entries(porStatus).map(([nome, value]) => ({ nome, value }));

  const precoMedio = anuncios.length
    ? (anuncios.reduce((acc, a) => acc + (a.preco || 0), 0) / anuncios.length).toFixed(2)
    : 0;

  return (
    <div className="du-root">
      <Navbar />
      <div className="du-body">
        <button className="du-back" onClick={() => navigate("/admin")}>← Voltar ao painel</button>

        <div className="du-header">
          <div className="du-avatar">{iniciais(usuario.nome)}</div>
          <div className="du-info">
            <h1 className="du-nome">{usuario.nome}</h1>
            <p className="du-email">{usuario.email}</p>
            <div className="du-tags">
              <span className={`du-perfil du-perfil-${usuario.perfil}`}>{usuario.perfil}</span>
              <span className="du-status" style={{ color: usuario.ativo ? "#1D9E75" : "#C0392B" }}>
                {usuario.ativo ? "● Ativo" : "○ Inativo"}
              </span>
            </div>
          </div>
        </div>

        <div className="du-stats">
          <div className="du-stat-card">
            <span className="du-stat-num">{anuncios.length}</span>
            <span className="du-stat-label">Anúncios postados</span>
          </div>
          <div className="du-stat-card">
            <span className="du-stat-num">{Number(usuario.media_avaliacao).toFixed(1)}</span>
            <span className="du-stat-label">Média de avaliação</span>
          </div>
          <div className="du-stat-card">
            <span className="du-stat-num">R$ {precoMedio}</span>
            <span className="du-stat-label">Preço médio</span>
          </div>
          <div className="du-stat-card">
            <span className="du-stat-num">{usuario.cidade || "—"}</span>
            <span className="du-stat-label">Cidade</span>
          </div>
        </div>

        {anuncios.length === 0 ? (
          <div className="du-vazio">
            <p>Este usuário ainda não postou nenhum anúncio.</p>
          </div>
        ) : (
          <div className="du-graficos">
            <div className="du-grafico-card">
              <h3 className="du-grafico-titulo">Anúncios por categoria</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={dadosCategoria}>
                  <XAxis dataKey="nome" tick={{ fontSize: 12, fill: "#7A5A3A" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#7A5A3A" }} />
                  <Tooltip />
                  <Bar dataKey="qtd" fill="#C45A10" radius={[8, 8, 0, 0]} name="Anúncios" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="du-grafico-card">
              <h3 className="du-grafico-titulo">Status dos anúncios</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={dadosStatus} dataKey="value" nameKey="nome"
                    cx="50%" cy="50%" outerRadius={75} innerRadius={35}
                    paddingAngle={2}
                    label={({ value }) => value}
                    labelLine={false}>
                    {dadosStatus.map((_, i) => (
                      <Cell key={i} fill={CORES[i % CORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {anuncios.length > 0 && (
          <div className="du-anuncios">
            <h3 className="du-grafico-titulo">Anúncios deste usuário</h3>
            {anuncios.map(a => (
              <div key={a.id} className="du-anuncio-item" onClick={() => navigate(`/anuncio/${a.id}`)}>
                <span className="du-anuncio-titulo">{a.titulo}</span>
                <span className="du-anuncio-preco">R$ {Number(a.preco).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
