import { useState, useEffect } from "react";
import { listarCategorias, criarCategoria, atualizarCategoria, deletarCategoria } from "../services/api";
import Loading from "./Loading";
import Modal from "./Modal";
import { useToast } from "./Toast";

export default function GerenciarCategorias() {
  const toast = useToast();
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [editando, setEditando] = useState(null);
  const [nomeEdit, setNomeEdit] = useState("");
  const [modalDeletar, setModalDeletar] = useState(null);

  function carregar() {
    setCarregando(true);
    listarCategorias()
      .then(data => setCategorias(Array.isArray(data) ? data : []))
      .catch(() => setErro("Nao foi possivel carregar as categorias."))
      .finally(() => setCarregando(false));
  }

  useEffect(() => { carregar(); }, []);

  async function handleCriar(e) {
    e.preventDefault();
    if (!novoNome.trim()) return;
    try {
      const nova = await criarCategoria({ nome: novoNome.trim() });
      setCategorias([...categorias, nova]);
      setNovoNome("");
      toast("Categoria criada!", "sucesso");
    } catch {
      toast("Erro ao criar categoria.", "erro");
    }
  }

  async function handleSalvar(id) {
    if (!nomeEdit.trim()) return;
    try {
      const atualizada = await atualizarCategoria(id, { nome: nomeEdit.trim() });
      setCategorias(categorias.map(c => c.id === id ? { ...c, ...atualizada } : c));
      setEditando(null);
      toast("Categoria atualizada!", "sucesso");
    } catch {
      toast("Erro ao atualizar.", "erro");
    }
  }

  async function handleDeletar(id) {
    try {
      await deletarCategoria(id);
      setCategorias(categorias.filter(c => c.id !== id));
      toast("Categoria removida.", "info");
    } catch {
      toast("Erro ao remover categoria.", "erro");
    }
    setModalDeletar(null);
  }

  if (carregando) return <Loading texto="Carregando categorias..." />;

  return (
    <div className="cat-admin">
      <form className="cat-form-novo" onSubmit={handleCriar}>
        <input
          placeholder="Nome da nova categoria"
          value={novoNome}
          onChange={e => setNovoNome(e.target.value)}
        />
        <button type="submit" className="btn-novo">+ Criar categoria</button>
      </form>

      {erro && <div className="admin-erro-banner">{erro}</div>}

      {categorias.length === 0 ? (
        <div className="admin-centro"><p className="admin-vazio">Nenhuma categoria cadastrada.</p></div>
      ) : (
        <div className="cat-lista">
          {categorias.map(c => (
            <div key={c.id} className="cat-item">
              {editando === c.id ? (
                <>
                  <input className="edit-input" value={nomeEdit}
                    onChange={e => setNomeEdit(e.target.value)} />
                  <div className="row-actions">
                    <button className="btn-sim" onClick={() => handleSalvar(c.id)}>Salvar</button>
                    <button className="btn-nao" onClick={() => setEditando(null)}>Cancelar</button>
                  </div>
                </>
              ) : (
                <>
                  <span className="cat-nome"><span className="cat-id">#{c.id}</span> {c.nome}</span>
                  <div className="row-actions">
                    <button className="btn-acao" onClick={() => { setEditando(c.id); setNomeEdit(c.nome); }}>Editar</button>
                    <button className="btn-deletar" onClick={() => setModalDeletar(c.id)}>Remover</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        aberto={modalDeletar !== null}
        titulo="Remover categoria"
        mensagem="Tem certeza? Anuncios que usam esta categoria podem ser afetados."
        textoConfirmar="Sim, remover"
        perigo
        onConfirmar={() => handleDeletar(modalDeletar)}
        onCancelar={() => setModalDeletar(null)}
      />
    </div>
  );
}
