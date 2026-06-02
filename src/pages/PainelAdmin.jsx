import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listarUsuarios, deletarUsuario, alternarStatus, estaLogado } from "../services/api";
import "./PainelAdmin.css";

function iniciais(nome) {
  if (!nome) return "?";
  return nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function PainelAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [confirmando, setConfirmando] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!estaLogado()) { navigate("/login"); return; }
    listarUsuarios()
      .then(data => setUsuarios(Array.isArray(data) ? data : []))
      .catch(() => setErro("Não foi possível carregar os usuários."))
      .finally(() => setCarregando(false));
  }, []);

  async function handleDeletar(id) {
    try {
      await deletarUsuario(id);
      setUsuarios(usuarios.filter(u => u.id !== id));
      setConfirmando(null);
    } catch {
      setErro("Erro ao deletar usuário.");
    }
  }

  async function handleAlternarStatus(id, ativo) {
    try {
      const atualizado = await alternarStatus(id, !ativo);
      setUsuarios(usuarios.map(u => u.id === id ? { ...u, ativo: atualizado.ativo } : u));
    } catch {
      setErro("Erro ao alterar status.");
    }
  }

  return (
    <div className="admin-root">
      <header className="admin-nav">
        <span className="admin-logo" onClick={() => navigate("/")}>Faz Tudo</span>
        <div className="admin-nav-info">
          <span className="admin-badge">Admin</span>
        </div>
      </header>

      <div className="admin-body">
        <div className="admin-header">
          <div>
            <h1 className="admin-title">Painel de controle</h1>
            <p className="admin-sub">Gerencie os usuários da plataforma</p>
          </div>
          <div className="admin-stat">
            <span className="stat-num">{usuarios.length}</span>
            <span className="stat-label">usuários cadastrados</span>
          </div>
        </div>

        {carregando ? (
          <div className="admin-centro"><div className="loading-spinner" /><p>Carregando...</p></div>
        ) : erro ? (
          <div className="admin-centro"><p className="erro-msg">{erro}</p></div>
        ) : (
          <div className="admin-tabela">
            <div className="tabela-header">
              <span>Usuário</span>
              <span>E-mail</span>
              <span>Perfil</span>
              <span>Status</span>
              <span></span>
            </div>
            {usuarios.map(u => (
              <div key={u.id} className="tabela-row">
                <div className="user-info">
                  <div className="user-avatar">{iniciais(u.nome)}</div>
                  <span className="user-nome">{u.nome}</span>
                </div>
                <span className="user-email">{u.email}</span>
                <span className={`perfil-tag perfil-${u.perfil?.toLowerCase()}`}>{u.perfil}</span>
                <span style={{ fontSize: 12, color: u.ativo ? "#1D9E75" : "#C0392B", fontWeight: 500 }}>
                  {u.ativo ? "Ativo" : "Inativo"}
                </span>
                <div className="row-actions">
                  {confirmando === u.id ? (
                    <div className="confirm-row">
                      <span className="confirm-texto">Confirmar?</span>
                      <button className="btn-sim" onClick={() => handleDeletar(u.id)}>Sim</button>
                      <button className="btn-nao" onClick={() => setConfirmando(null)}>Não</button>
                    </div>
                  ) : (
                    <button className="btn-deletar" onClick={() => setConfirmando(u.id)}>Remover</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
