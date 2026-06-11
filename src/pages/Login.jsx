import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api";
import { validarEmail, validarSenha } from "../services/validacao";
import "./Auth.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", senha: "" });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErros({ ...erros, [name]: "" });
    setErroGeral("");
  }

  function validar() {
    const novosErros = {
      email: validarEmail(form.email),
      senha: validarSenha(form.senha),
    };
    setErros(novosErros);
    return !novosErros.email && !novosErros.senha;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) return;
    setLoading(true);
    setErroGeral("");
    try {
      await login({ email: form.email, senha: form.senha });
      navigate("/");
    } catch (err) {
      setErroGeral(err?.erro || "E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-logo"><span className="logo-text">Faz Tudo</span></div>
        <p className="auth-tagline">Servicos perto de voce, de quem voce ja conhece</p>
        <h1 className="auth-title">Entrar</h1>
        {erroGeral && <div className="auth-erro">{erroGeral}</div>}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label>E-mail</label>
            <input type="email" name="email" placeholder="seu@email.com"
              className={erros.email ? "input-erro" : ""}
              value={form.email} onChange={handleChange} />
            {erros.email && <span className="campo-erro">{erros.email}</span>}
          </div>
          <div className="field">
            <label>Senha</label>
            <input type="password" name="senha" placeholder="********"
              className={erros.senha ? "input-erro" : ""}
              value={form.senha} onChange={handleChange} />
            {erros.senha && <span className="campo-erro">{erros.senha}</span>}
          </div>
          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : "Entrar"}
          </button>
        </form>
        <p className="auth-switch">Nao tem conta? <Link to="/register">Cadastre-se</Link></p>
      </div>
    </div>
  );
}
