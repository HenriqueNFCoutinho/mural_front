const BASE_URL = "http://localhost:5000";

async function request(method, path, body = null) {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem("token");
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, config);
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

export async function registrar(dados) {
  return request("POST", "/auth/register", dados);
}

export async function login(dados) {
  const data = await request("POST", "/auth/login", dados);
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario || data));
  }
  return data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}

export const estaLogado = () => !!localStorage.getItem("token");
export const usuarioAtual = () => {
  const u = localStorage.getItem("usuario");
  return u ? JSON.parse(u) : null;
};

export const listarAnuncios = () => request("GET", "/anuncios");
export const buscarAnuncio  = (id) => request("GET", `/anuncios/${id}`);
export const criarAnuncio   = (dados) => request("POST", "/anuncios", dados);
export const atualizarAnuncio = (id, dados) => request("PATCH", `/anuncios/${id}`, dados);
export const deletarAnuncio = (id) => request("DELETE", `/anuncios/${id}`);

export const criarContrato     = (dados) => request("POST", "/contratos", dados);
export const listarContratos   = () => request("GET", "/contratos");
export const atualizarContrato = (id, status) => request("PATCH", `/contratos/${id}/status`, { status });

export const criarAvaliacao = (dados) => request("POST", "/avaliacoes", dados);

export const listarUsuarios = () => request("GET", "/adm/usuarios");
export const deletarUsuario = (id) => request("DELETE", `/adm/usuarios/${id}`);
