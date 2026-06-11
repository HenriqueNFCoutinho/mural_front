import { useNavigate } from "react-router-dom";
import { estaLogado, ehAdmin, logout } from "../services/api";
import { useTheme } from "./Themecontext";
import "./Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const { tema, alternarTema } = useTheme();
  const logado = estaLogado();
  const admin = ehAdmin();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="navbar">
      <span className="navbar-logo" onClick={() => navigate("/")}>Faz Tudo</span>
      <div className="navbar-actions">
        <button className="nav-tema" onClick={alternarTema} title="Alternar tema">
          {tema === "claro" ? "🌙" : "☀️"}
        </button>
        {logado ? (
          <>
            <button className="nav-link" onClick={() => navigate("/meus-contratos")}>Meus contratos</button>
            {admin && <button className="nav-link" onClick={() => navigate("/admin")}>Admin</button>}
            <button className="nav-link" onClick={handleLogout}>Sair</button>
            <button className="nav-btn-primary" onClick={() => navigate("/criar-anuncio")}>+ Anunciar</button>
          </>
        ) : (
          <>
            <button className="nav-link" onClick={() => navigate("/login")}>Entrar</button>
            <button className="nav-btn-primary" onClick={() => navigate("/register")}>Cadastrar</button>
          </>
        )}
      </div>
    </header>
  );
}
