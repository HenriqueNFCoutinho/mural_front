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

// ── Auth ──
export async function registrar(dados) {
  return request("POST", "/auth/register", dados);
}

export async function login(dados) {
  const data = await request("POST", "/auth/login", dados);
  const token = data?.data?.access_token;
  if (token) localStorage.setItem("token", token);
  return data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}

// ── Helpers ──
export const estaLogado = () => !!localStorage.getItem("token");
export const usuarioAtual = () => {
  const u = localStorage.getItem("usuario");
  return u ? JSON.parse(u) : null;
};

// ── Categorias ──
export const listarCategorias = () => request("GET", "/categorias");
export const buscarCategoria  = (id) => request("GET", `/categorias/${id}`);
export const listarAnuncios   = ()           => request("GET",    "/anuncios");
export const buscarAnuncio    = (id)         => request("GET",    `/anuncios/${id}`);
export const criarAnuncio     = (dados)      => request("POST",   "/anuncios", dados);
export const atualizarAnuncio = (id, dados)  => request("PUT",    `/anuncios/${id}`, dados);
export const deletarAnuncio   = (id)         => request("DELETE", `/anuncios/${id}`);

// ── Contratos ──
export const criarContrato     = (dados)        => request("POST",  "/contratos", dados);
export const buscarContrato    = (id)           => request("GET",   `/contratos/${id}`);
export const atualizarContrato = (id, status)   => request("PATCH", `/contratos/${id}/status`, { status });

// ── Avaliações ──
export const criarAvaliacao = (dados) => request("POST", "/avaliacoes", dados);

// ── Admin ──
export const listarUsuarios  = ()    => request("GET",    "/adm");
export const deletarUsuario  = (id)  => request("DELETE", `/adm/${id}`);
export const alternarStatus  = (id, ativo) => request("PATCH", `/adm/${id}/status`, { ativo });
