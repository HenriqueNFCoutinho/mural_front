import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registrar } from "../services/api";
import "./Auth.css";

export default function Register() {
  const [form, setForm] = useState({
    nome: "", email: "", senha: "",
    bairro: "", cidade: "",
  });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErro("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErro("");
    try {
      await registrar(form);
      navigate("/login");
    } catch (err) {
      setErro(err?.erro || "Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-root">
      <div className="auth-card auth-card--wide">
        <div className="auth-logo">
          <span className="logo-text">Faz Tudo</span>
        </div>
        <p className="auth-tagline">Crie sua conta gratuitamente</p>
        <h1 className="auth-title">Cadastrar</h1>
        {erro && <div className="auth-erro">{erro}</div>}
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>Nome completo</label>
            <input type="text" name="nome" placeholder="Seu nome"
              value={form.nome} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>E-mail</label>
            <input type="email" name="email" placeholder="seu@email.com"
              value={form.email} onChange={handleChange} required />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Bairro</label>
              <input type="text" name="bairro" placeholder="Ex: Centro"
                value={form.bairro} onChange={handleChange} />
            </div>
            <div className="field">
              <label>Cidade</label>
              <input type="text" name="cidade" placeholder="Ex: Cajazeiras"
                value={form.cidade} onChange={handleChange} />
            </div>
          </div>
          <div className="field">
            <label>Senha</label>
            <input type="password" name="senha" placeholder="Mínimo 8 caracteres"
              value={form.senha} onChange={handleChange} required minLength={8} />
          </div>
          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : "Criar conta"}
          </button>
        </form>
        <p className="auth-switch">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
