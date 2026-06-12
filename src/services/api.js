const BASE_URL = "http://localhost:8000";

async function request(method, path, body = null) {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, config);
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

function idDoToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || payload.identity || null;
  } catch {
    return null;
  }
}

export async function login(dados) {
  const data = await request("POST", "/auth/login", dados);
  const token = data?.data?.access_token;
  if (token) localStorage.setItem("token", token);
  try {
    await request("GET", "/adm");
    localStorage.setItem("perfil", "admin");
  } catch {
    localStorage.setItem("perfil", "user");
  }
  return data;
}

export async function registrar(dados) {
  return request("POST", "/auth/register", dados);
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("perfil");
}

export const estaLogado  = () => !!localStorage.getItem("token");
export const ehAdmin     = () => localStorage.getItem("perfil") === "admin";
export const meuId       = () => idDoToken();

export const listarAnuncios   = ()          => request("GET",    "/anuncios");
export const buscarAnuncio    = (id)        => request("GET",    `/anuncios/${id}`);
export const criarAnuncio     = (dados)     => request("POST",   "/anuncios", dados);
export const atualizarAnuncio = (id, dados) => request("PUT",    `/anuncios/${id}`, dados);
export const deletarAnuncio   = (id)        => request("DELETE", `/anuncios/${id}`);

export const listarCategorias   = ()          => request("GET",    "/categorias");
export const buscarCategoria    = (id)        => request("GET",    `/categorias/${id}`);
export const criarCategoria     = (dados)     => request("POST",   "/categorias", dados);
export const atualizarCategoria = (id, dados) => request("PUT",    `/categorias/${id}`, dados);
export const deletarCategoria   = (id)        => request("DELETE", `/categorias/${id}`);

export const criarContrato     = (dados)       => request("POST",  "/contratos", dados);
export const listarContratos   = ()            => request("GET",   "/contratos");
export const buscarContrato    = (id)          => request("GET",   `/contratos/${id}`);
export const atualizarContrato = (id, status)  => request("PATCH", `/contratos/${id}/status`, { status });

export const criarAvaliacao      = (dados)      => request("POST", "/avaliacao", dados);
export const listarAvaliacoes    = (_anuncioId) => request("GET",  "/avaliacao");
export const avaliacaoDoContrato = (contratoId) => request("GET",  "/avaliacao").then(lista => (Array.isArray(lista) ? lista : []).find(a => a.contrato_id === Number(contratoId)) || null);

export const listarUsuarios    = ()           => request("GET",    "/adm");
export const buscarUsuario     = (id)         => request("GET",    `/adm/${id}`);
export const criarUsuarioAdm   = (dados)      => request("POST",   "/adm", dados);
export const atualizarUsuario  = (id, dados)  => request("PUT",    `/adm/${id}`, dados);
export const deletarUsuario    = (id)         => request("DELETE", `/adm/${id}`);
export const filtrarPorPerfil  = (perfil)     => request("GET",    `/adm/filtro-perfil?perfil=${perfil}`);
export const alternarStatus    = (id, ativo)  => request("PATCH",  `/adm/${id}/status`, { ativo });
export const alterarPerfil     = (id, perfil) => request("PATCH",  `/adm/${id}/perfil`, { perfil });
export const deletarMinhaConta = ()           => request("DELETE", "/adm/me");
