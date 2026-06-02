import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { buscarAnuncio, atualizarAnuncio } from "../services/api";
import "./CriarAnuncio.css";

const CATEGORIAS = [
  { id: 1, label: "Monitoria" },
  { id: 2, label: "Reparos" },
  { id: 3, label: "Tecnologia" },
  { id: 4, label: "Arte & Design" },
  { id: 5, label: "Entregas" },
  { id: 6, label: "Jardinagem" },
  { id: 7, label: "Outros" },
];

const TIPOS_PRECO = [
  { value: "hora", label: "por hora" },
  { value: "projeto", label: "por projeto" },
  { value: "visita", label: "por visita" },
  { value: "entrega", label: "por entrega" },
  { value: "combinado", label: "a combinar" },
];

export default function EditarAnuncio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [form, setForm] = useState({
    categoria_id: "", titulo: "", descricao: "", preco: "", tipo_preco: "hora",
  });

  useEffect(() => {
    buscarAnuncio(id)
      .then(data => setForm({
        categoria_id: String(data.categoria_id),
        titulo: data.titulo,
        descricao: data.descricao,
        preco: data.preco,
        tipo_preco: "hora",
      }))
      .catch(() => navigate("/"))
      .finally(() => setCarregando(false));
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    try {
      await atualizarAnuncio(id, {
        titulo: form.titulo,
        descricao: form.descricao,
        preco: parseFloat(form.preco),
      });
      navigate(`/anuncio/${id}`);
    } catch (err) {
      setErro(err?.erro || "Erro ao atualizar anúncio.");
    } finally {
      setLoading(false);
    }
  }

  const progresso = [form.categoria_id, form.titulo, form.descricao, form.preco].filter(Boolean).length;

  if (carregando) return (
    <div className="criar-root">
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <div style={{ width: 28, height: 28, border: "3px solid #EDE0D4", borderTopColor: "#C45A10", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    </div>
  );

  return (
    <div className="criar-root">
      <header className="criar-nav">
        <button className="criar-back" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
            <path d="M12 15L7 10l5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Voltar
        </button>
        <span className="criar-nav-title">Editar anúncio</span>
        <div style={{ width: 80 }} />
      </header>

      <div className="criar-body">
        <div className="progresso-wrap">
          <div className="progresso-bar">
            <div className="progresso-fill" style={{ width: `${(progresso / 4) * 100}%` }} />
          </div>
          <span className="progresso-label">{progresso} de 4 campos preenchidos</span>
        </div>

        {erro && <div style={{ color: "#C0392B", background: "#FDE8E8", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 8 }}>{erro}</div>}

        <form className="criar-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Categoria <span className="obrigatorio">*</span></label>
            <div className="cat-grid">
              {CATEGORIAS.map(c => (
                <button key={c.id} type="button"
                  className={`cat-opt${form.categoria_id === String(c.id) ? " selected" : ""}`}
                  onClick={() => setForm({ ...form, categoria_id: String(c.id) })}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field-float">
            <input type="text" name="titulo" id="titulo-edit" value={form.titulo}
              onChange={handleChange} maxLength={80} required placeholder=" " />
            <label htmlFor="titulo-edit">Título <span className="obrigatorio">*</span></label>
            <span className="char-count">{form.titulo.length}/80</span>
          </div>

          <div className="field-float">
            <textarea name="descricao" id="descricao-edit" value={form.descricao}
              onChange={handleChange} maxLength={400} required placeholder=" " />
            <label htmlFor="descricao-edit">Descrição <span className="obrigatorio">*</span></label>
            <span className="char-count">{form.descricao.length}/400</span>
          </div>

          <div className="field">
            <label>Preço <span className="obrigatorio">*</span></label>
            <div className="preco-row">
              <div className="preco-input-wrap">
                <span className="preco-prefix">R$</span>
                <input type="number" name="preco" placeholder="0,00" value={form.preco}
                  onChange={handleChange} min="0" step="0.01" required />
              </div>
              <select name="tipo_preco" value={form.tipo_preco} onChange={handleChange}>
                {TIPOS_PRECO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          <button className="btn-publicar" type="submit" disabled={loading || progresso < 4}>
            {loading ? <span className="spinner" /> : "Salvar alterações"}
          </button>
        </form>
      </div>
    </div>
  );
}
