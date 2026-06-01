import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function CriarAnuncio() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    categoria_id: "",
    titulo: "",
    descricao: "",
    preco: "",
    tipo_preco: "hora",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 800);
  }

  const progresso = [
    form.categoria_id,
    form.titulo,
    form.descricao,
    form.preco,
  ].filter(Boolean).length;

  return (
    <div className="criar-root">

      <header className="criar-nav">
        <button className="criar-back" onClick={() => navigate("/")}>
          <svg viewBox="0 0 20 20" fill="none" width="18" height="18">
            <path d="M12 15L7 10l5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Voltar
        </button>
        <span className="criar-nav-title">Novo anúncio</span>
        <div style={{ width: 80 }} />
      </header>

      <div className="criar-body">

        <div className="progresso-wrap">
          <div className="progresso-bar">
            <div className="progresso-fill" style={{ width: `${(progresso / 4) * 100}%` }} />
          </div>
          <span className="progresso-label">{progresso} de 4 campos preenchidos</span>
        </div>

        <form className="criar-form" onSubmit={handleSubmit}>

          <div className="field">
            <label>Categoria <span className="obrigatorio">*</span></label>
            <div className="cat-grid">
              {CATEGORIAS.map(c => (
                <button
                  key={c.id}
                  type="button"
                  className={`cat-opt${form.categoria_id === String(c.id) ? " selected" : ""}`}
                  onClick={() => setForm({ ...form, categoria_id: String(c.id) })}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field-float">
            <input
              type="text"
              name="titulo"
              id="titulo"
              value={form.titulo}
              onChange={handleChange}
              maxLength={80}
              required
              placeholder=" "
            />
            <label htmlFor="titulo">Título do anúncio <span className="obrigatorio">*</span></label>
            <span className="char-count">{form.titulo.length}/80</span>
          </div>

          <div className="field-float">
            <textarea
              name="descricao"
              id="descricao"
              value={form.descricao}
              onChange={handleChange}
              maxLength={400}
              required
              placeholder=" "
            />
            <label htmlFor="descricao">Descrição <span className="obrigatorio">*</span></label>
            <span className="char-count">{form.descricao.length}/400</span>
          </div>

          <div className="field">
            <label>Preço <span className="obrigatorio">*</span></label>
            <div className="preco-row">
              <div className="preco-input-wrap">
                <span className="preco-prefix">R$</span>
                <input
                  type="number"
                  name="preco"
                  placeholder="0,00"
                  value={form.preco}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <select name="tipo_preco" value={form.tipo_preco} onChange={handleChange}>
                {TIPOS_PRECO.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {form.titulo && (
            <div className="preview-wrap">
              <p className="preview-label">Pré-visualização</p>
              <div className="preview-card">
                <div className="preview-top">
                  {form.categoria_id && (
                    <span className="preview-cat">
                      {CATEGORIAS.find(c => String(c.id) === form.categoria_id)?.label}
                    </span>
                  )}
                  {form.preco && (
                    <span className="preview-preco">
                      R$ {form.preco}
                      <span className="preview-tipo">
                        /{TIPOS_PRECO.find(t => t.value === form.tipo_preco)?.value}
                      </span>
                    </span>
                  )}
                </div>
                <p className="preview-titulo">{form.titulo}</p>
                {form.descricao && (
                  <p className="preview-desc">{form.descricao}</p>
                )}
              </div>
            </div>
          )}

          <button className="btn-publicar" type="submit" disabled={loading || progresso < 4}>
            {loading ? <span className="spinner" /> : "Publicar anúncio"}
          </button>

        </form>
      </div>
    </div>
  );
}
