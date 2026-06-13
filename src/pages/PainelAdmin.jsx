import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  listarUsuarios, deletarUsuario, alternarStatus,
  alterarPerfil, atualizarUsuario, filtrarPorPerfil,
  criarUsuarioAdm, estaLogado, ehAdmin
} from "../services/api";
import Navbar from "../components/Navbar";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import GerenciarCategorias from "../components/GerenciarCategorias";
import "./PainelAdmin.css";



function iniciais(nome) {
  if (!nome) return "?";
  return nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function PainelAdmin() {
  const toast = useToast();
  const [aba, setAba] = useState("usuarios");
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState("todos");
  const [confirmando, setConfirmando] = useState(null);
  const [editando, setEditando] = useState(null);
  const [formEdit, setFormEdit] = useState({ nome: "", email: "", numero: "", bairro: "", cidade: "" });
  const [mostrarCriar, setMostrarCriar] = useState(false);
  const [formNovo, setFormNovo] = useState({ nome: "", email: "", senha: "", numero: "", perfil: "user", bairro: "", cidade: "" });
  const navigate = useNavigate();

  function carregar() {
    setCarregando(true);
    const promise = filtro === "todos" ? listarUsuarios() : filtrarPorPerfil(filtro);
    promise
      .then(data => setUsuarios(Array.isArray(data) ? data : []))
      .catch(() => toast("Não foi possível carregar os usuários.", "erro"))
      .finally(() => setCarregando(false));
  }

  useEffect(() => {
    if (!estaLogado()) { navigate("/login"); return; }
    if (!ehAdmin()) { navigate("/"); return; }
    carregar();
  }, [filtro]);

  async function handleDeletar(id) {
    try {
      await deletarUsuario(id);
      setUsuarios(usuarios.filter(u => u.id !== id));
      setConfirmando(null);
    } catch { toast("Erro ao deletar usuário.", "erro"); }
  }

  async function handleStatus(id, ativoAtual) {
    try {
      const atualizado = await alternarStatus(id, !ativoAtual);
      setUsuarios(usuarios.map(u => u.id === id ? { ...u, ativo: atualizado.ativo } : u));
    } catch { toast("Erro ao alterar status.", "erro"); }
  }

  async function handlePerfil(id, perfilAtual) {
    const novo = perfilAtual === "admin" ? "user" : "admin";
    try {
      const atualizado = await alterarPerfil(id, novo);
      setUsuarios(usuarios.map(u => u.id === id ? { ...u, perfil: atualizado.perfil } : u));
    } catch { toast("Erro ao alterar perfil.", "erro"); }
  }

  function abrirEdicao(u) {
    setEditando(u.id);
    setFormEdit({ nome: u.nome || "", email: u.email || "", numero: u.numero || "", bairro: u.bairro || "", cidade: u.cidade || "" });
  }

  async function handleSalvarEdicao(id) {
    try {
      const atualizado = await atualizarUsuario(id, formEdit);
      setUsuarios(usuarios.map(u => u.id === id ? { ...u, ...atualizado } : u));
      setEditando(null);
    } catch { toast("Erro ao salvar edição.", "erro"); }
  }

  async function handleCriar(e) {
    e.preventDefault();
    try {
      const numeroLimpo = formNovo.numero.replace(/\D/g, "");
      const novo = await criarUsuarioAdm({ ...formNovo, numero: numeroLimpo });
      setUsuarios([...usuarios, novo]);
      setMostrarCriar(false);
      setFormNovo({ nome: "", email: "", senha: "", numero: "", perfil: "user", bairro: "", cidade: "" });
    } catch (err) { toast(err?.erro || "Erro ao criar usuário.", "erro"); }
  }

  return (
    <div className="admin-root">
      <Navbar />
      <div className="admin-body">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Painel de controle</h1>
            <p className="admin-sub">Gerencie a plataforma</p>
          </div>
          <div className="admin-stat">
            <span className="stat-num">{aba === "usuarios" ? usuarios.length : ""}</span>
            <span className="stat-label">{aba === "usuarios" ? "usuários" : "categorias"}</span>
          </div>
        </div>

        <div className="admin-abas">
          <button className={`aba-btn${aba === "usuarios" ? " ativo" : ""}`}
            onClick={() => setAba("usuarios")}>Usuários</button>
          <button className={`aba-btn${aba === "categorias" ? " ativo" : ""}`}
            onClick={() => setAba("categorias")}>Categorias</button>
        </div>

        {aba === "categorias" ? (
          <GerenciarCategorias />
        ) : (
        <>
        <div className="admin-toolbar">
          <div className="admin-filtros">
            {["todos", "user", "admin"].map(f => (
              <button key={f}
                className={`filtro-btn${filtro === f ? " ativo" : ""}`}
                onClick={() => setFiltro(f)}>
                {f === "todos" ? "Todos" : f === "user" ? "Usuários" : "Admins"}
              </button>
            ))}
          </div>
          <button className="btn-novo" onClick={() => setMostrarCriar(!mostrarCriar)}>
            {mostrarCriar ? "Cancelar" : "+ Novo usuário"}
          </button>
        </div>

        {mostrarCriar && (
          <form className="form-novo" onSubmit={handleCriar}>
            <input placeholder="Nome" value={formNovo.nome} required
              onChange={e => setFormNovo({ ...formNovo, nome: e.target.value })} />
            <input placeholder="E-mail" type="email" value={formNovo.email} required
              onChange={e => setFormNovo({ ...formNovo, email: e.target.value })} />
            <input placeholder="Senha" type="password" value={formNovo.senha} required
              onChange={e => setFormNovo({ ...formNovo, senha: e.target.value })} />
            <input placeholder="Telefone (obrigatório)" type="tel" value={formNovo.numero} required
              onChange={e => setFormNovo({ ...formNovo, numero: e.target.value })} />
            <select value={formNovo.perfil} onChange={e => setFormNovo({ ...formNovo, perfil: e.target.value })}>
              <option value="user">Usuário</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="btn-salvar-novo">Criar</button>
          </form>
        )}


        {carregando ? (
          <Loading texto="Carregando usuários..." />
        ) : usuarios.length === 0 ? (
          <div className="admin-centro"><p className="admin-vazio">Nenhum usuário encontrado.</p></div>
        ) : (
          <div className="admin-tabela">
            <div className="tabela-header">
              <span>Usuário</span>
              <span>E-mail</span>
              <span>Perfil</span>
              <span>Status</span>
              <span>Ações</span>
            </div>
            {usuarios.map(u => (
              <div key={u.id} className="tabela-row">
                {editando === u.id ? (
                  <>
                    <input className="edit-input" value={formEdit.nome}
                      onChange={e => setFormEdit({ ...formEdit, nome: e.target.value })} />
                    <input className="edit-input" value={formEdit.email}
                      onChange={e => setFormEdit({ ...formEdit, email: e.target.value })} />
                    <input className="edit-input" placeholder="Telefone" value={formEdit.numero}
                      onChange={e => setFormEdit({ ...formEdit, numero: e.target.value })} />
                    <input className="edit-input" placeholder="Bairro" value={formEdit.bairro}
                      onChange={e => setFormEdit({ ...formEdit, bairro: e.target.value })} />
                    <input className="edit-input" placeholder="Cidade" value={formEdit.cidade}
                      onChange={e => setFormEdit({ ...formEdit, cidade: e.target.value })} />
                    <span></span><span></span>
                    <div className="row-actions">
                      <button className="btn-sim" onClick={() => handleSalvarEdicao(u.id)}>Salvar</button>
                      <button className="btn-nao" onClick={() => setEditando(null)}>Cancelar</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="user-info" onClick={() => navigate(`/admin/usuario/${u.id}`)} style={{ cursor: "pointer" }}>
                      <div className="user-avatar">{iniciais(u.nome)}</div>
                      <span className="user-nome">{u.nome}</span>
                    </div>
                    <span className="user-email">{u.email}</span>
                    <span className={`perfil-tag perfil-${u.perfil}`}>{u.perfil}</span>
                    <button className="status-toggle" onClick={() => handleStatus(u.id, u.ativo)}
                      style={{ color: u.ativo ? "#1D9E75" : "#C0392B" }}>
                      {u.ativo ? "● Ativo" : "○ Inativo"}
                    </button>
                    <div className="row-actions">
                      {confirmando === u.id ? (
                        <div className="confirm-row">
                          <button className="btn-sim" onClick={() => handleDeletar(u.id)}>Sim</button>
                          <button className="btn-nao" onClick={() => setConfirmando(null)}>Não</button>
                        </div>
                      ) : (
                        <>
                          <button className="btn-acao" onClick={() => abrirEdicao(u)}>Editar</button>
                          <button className="btn-acao" onClick={() => handlePerfil(u.id, u.perfil)}>
                            {u.perfil === "admin" ? "↓ User" : "↑ Admin"}
                          </button>
                          <button className="btn-deletar" onClick={() => setConfirmando(u.id)}>Remover</button>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
}
