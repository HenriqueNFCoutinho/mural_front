import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import CriarAnuncio from "./pages/CriarAnuncio";
import EditarAnuncio from "./pages/EditarAnuncio";
import DetalheAnuncio from "./pages/DetalheAnuncio";
import PainelAdmin from "./pages/PainelAdmin";
import MeusContratos from "./pages/MeusContratos";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/criar-anuncio" element={<CriarAnuncio />} />
        <Route path="/editar-anuncio/:id" element={<EditarAnuncio />} />
        <Route path="/anuncio/:id" element={<DetalheAnuncio />} />
        <Route path="/admin" element={<PainelAdmin />} />
        <Route path="/meus-contratos" element={<MeusContratos />} />
      </Routes>
    </BrowserRouter>
  );
}
