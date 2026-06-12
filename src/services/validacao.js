
export function validarEmail(email) {
  if (!email) return "O e-mail é obrigatório.";
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return "Digite um e-mail válido.";
  return "";
}

export function validarSenha(senha) {
  if (!senha) return "A senha é obrigatória.";
  if (senha.length < 8) return "A senha precisa ter no mínimo 8 caracteres.";
  return "";
}

export function validarNome(nome) {
  if (!nome || nome.trim().length < 2) return "Digite seu nome completo.";
  return "";
}
