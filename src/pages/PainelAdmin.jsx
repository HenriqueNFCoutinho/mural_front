import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { listarUsuarios, deletarUsuario, usuarioAtual, estaLogado } from "../services/api";
import "./PainelAdmin.css";

function iniciais(nome) {
  return nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

export default function PainelAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [confirmando, setConfirmando] = useState(null);
  const navigate = useNavigate();
  const usuario = usuarioAtual();

  useEffect(() => {
    if (!estaLogado()) { navigate("/login"); return; }

    listarUsuarios()
      .then(data => setUsuarios(data))
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

  return (
    <div className="admin-root">

      {/* Navbar */}
      <header className="admin-nav">
        <span className="admin-logo" onClick={() => navigate("/")}>Faz Tudo</span>
        <div className="admin-nav-info">
          <span className="admin-badge">Admin</span>
          <span className="admin-nome">{usuario?.nome || "Administrador"}</span>
        </div>
      </header>

      <div className="admin-body">

        {/* Header da página */}
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

        {/* Conteúdo */}
        {carregando ? (
          <div className="admin-centro">
            <div className="loading-spinner" />
            <p>Carregando usuários...</p>
          </div>
        ) : erro ? (
          <div className="admin-centro">
            <p className="erro-msg">{erro}</p>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="admin-centro">
            <p className="admin-vazio">Nenhum usuário cadastrado ainda.</p>
          </div>
        ) : (
          <div className="admin-tabela">
            <div className="tabela-header">
              <span>Usuário</span>
              <span>E-mail</span>
              <span>Perfil</span>
              <span>Cidade</span>
              <span></span>
            </div>

            {usuarios.map(u => (
              <div key={u.id} className="tabela-row">
                <div className="user-info">
                  <div className="user-avatar">{iniciais(u.nome || "U")}</div>
                  <span className="user-nome">{u.nome}</span>
                </div>
                <span className="user-email">{u.email}</span>
                <span className={`perfil-tag perfil-${u.perfil}`}>{u.perfil || "—"}</span>
                <span className="user-cidade">{u.cidade || "—"}</span>
                <div className="row-actions">
                  {confirmando === u.id ? (
                    <div className="confirm-row">
                      <span className="confirm-texto">Tem certeza?</span>
                      <button className="btn-sim" onClick={() => handleDeletar(u.id)}>Sim</button>
                      <button className="btn-nao" onClick={() => setConfirmando(null)}>Não</button>
                    </div>
                  ) : (
                    <button className="btn-deletar" onClick={() => setConfirmando(u.id)}>
                      Remover
                    </button>
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
