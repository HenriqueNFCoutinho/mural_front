import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";
import "./Auth.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", senha: "" });
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
      const res = await login({ email: form.email, senha: form.senha });
      // backend retorna { status: "success", data: { access_token, token_type } }
      if (res?.status === "success") {
        navigate("/");
      }
    } catch (err) {
      setErro(err?.erro || "E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-text">Faz Tudo</span>
        </div>
        <p className="auth-tagline">Serviços perto de você, de quem você já conhece</p>

        <h1 className="auth-title">Entrar</h1>

        {erro && <div className="auth-erro">{erro}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>E-mail</label>
            <input type="email" name="email" placeholder="seu@email.com"
              value={form.email} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Senha</label>
            <input type="password" name="senha" placeholder="••••••••"
              value={form.senha} onChange={handleChange} required />
            <a className="forgot" href="#">Esqueci minha senha</a>
          </div>
          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : "Entrar"}
          </button>
        </form>

        <div className="auth-divider"><span>ou</span></div>
        <button className="btn-admin" onClick={() => navigate("/admin")}>
          Entrar como administrador
        </button>

        <p className="auth-switch">
          Não tem conta? <Link to="/register">Cadastre-se grátis</Link>
        </p>
      </div>
    </div>
  );
}
