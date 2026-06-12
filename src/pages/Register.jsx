import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registrar } from "../services/api";
import { validarEmail, validarSenha, validarNome } from "../services/validacao";
import "./Auth.css";

export default function Register() {
  const [form, setForm] = useState({ nome: "", email: "", senha: "", numero: "", bairro: "", cidade: "" });
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
      nome: validarNome(form.nome),
      email: validarEmail(form.email),
      senha: validarSenha(form.senha),
    };
    setErros(novosErros);
    return !novosErros.nome && !novosErros.email && !novosErros.senha;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validar()) return;
    setLoading(true);
    setErroGeral("");
    try {
      await registrar({ ...form, perfil: "user" });
      navigate("/login");
    } catch (err) {
      setErroGeral(err?.erro || "Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-root">
      <div className="auth-card auth-card--wide">
        <div className="auth-logo"><span className="logo-text">Faz Tudo</span></div>
        <p className="auth-tagline">Crie sua conta gratuitamente</p>
        <h1 className="auth-title">Cadastrar</h1>
        {erroGeral && <div className="auth-erro">{erroGeral}</div>}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label>Nome completo</label>
            <input type="text" name="nome" placeholder="Seu nome"
              className={erros.nome ? "input-erro" : ""}
              value={form.nome} onChange={handleChange} />
            {erros.nome && <span className="campo-erro">{erros.nome}</span>}
          </div>
          <div className="field">
            <label>E-mail</label>
            <input type="email" name="email" placeholder="seu@email.com"
              className={erros.email ? "input-erro" : ""}
              value={form.email} onChange={handleChange} />
            {erros.email && <span className="campo-erro">{erros.email}</span>}
          </div>
          <div className="field">
            <label>Telefone / WhatsApp</label>
            <input type="tel" name="numero" placeholder="(83) 99999-9999"
              value={form.numero} onChange={handleChange} />
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
            <input type="password" name="senha" placeholder="Minimo 8 caracteres"
              className={erros.senha ? "input-erro" : ""}
              value={form.senha} onChange={handleChange} />
            {erros.senha && <span className="campo-erro">{erros.senha}</span>}
          </div>
          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : "Criar conta"}
          </button>
        </form>
        <p className="auth-switch">Ja tem conta? <Link to="/login">Entrar</Link></p>
      </div>
    </div>
  );
}
