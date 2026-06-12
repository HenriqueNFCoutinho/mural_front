import { useState, useEffect } from "react";
import { listarCategorias, criarCategoria, atualizarCategoria, deletarCategoria } from "../services/api";
import Loading from "./Loading";
import Modal from "./Modal";
import { useToast } from "./Toast";

const CATEGORIAS_MOCK = [
  { id: 1, nome: "Monitoria" },
  { id: 2, nome: "Reparos" },
  { id: 3, nome: "Tecnologia" },
  { id: 4, nome: "Arte & Design" },
  { id: 5, nome: "Entregas" },
  { id: 6, nome: "Jardinagem" },
];

export default function GerenciarCategorias() {
  const toast = useToast();
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [usandoMock, setUsandoMock] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [confirmarCriar, setConfirmarCriar] = useState(false);
  const [editando, setEditando] = useState(null);
  const [nomeEdit, setNomeEdit] = useState("");
  const [modalDeletar, setModalDeletar] = useState(null);

  function carregar() {
    setCarregando(true);
    listarCategorias()
      .then(data => setCategorias(Array.isArray(data) ? data : []))
      .catch(() => { setCategorias(CATEGORIAS_MOCK); setUsandoMock(true); })
      .finally(() => setCarregando(false));
  }

  useEffect(() => { carregar(); }, []);

  function handleSubmitForm(e) {
    e.preventDefault();
    if (!novoNome.trim()) return;
    setConfirmarCriar(true);
  }

  async function handleCriar() {
    if (!novoNome.trim()) return;
    if (usandoMock) {
      const novoId = Math.max(0, ...categorias.map(c => c.id)) + 1;
      setCategorias([...categorias, { id: novoId, nome: novoNome.trim() }]);
      setNovoNome("");
      setConfirmarCriar(false);
      toast("Categoria criada! (mock)", "sucesso");
      return;
    }
    try {
      const nova = await criarCategoria({ nome: novoNome.trim() });
      setCategorias([...categorias, nova]);
      setNovoNome("");
      toast("Categoria criada!", "sucesso");
    } catch {
      toast("Erro ao criar categoria.", "erro");
    }
    setConfirmarCriar(false);
  }

  async function handleSalvar(id) {
    if (!nomeEdit.trim()) return;
    if (usandoMock) {
      setCategorias(categorias.map(c => c.id === id ? { ...c, nome: nomeEdit.trim() } : c));
      setEditando(null);
      toast("Categoria atualizada! (mock)", "sucesso");
      return;
    }
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
    if (usandoMock) {
      setCategorias(categorias.filter(c => c.id !== id));
      toast("Categoria removida. (mock)", "info");
      setModalDeletar(null);
      return;
    }
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
      <form className="cat-form-novo" onSubmit={handleSubmitForm}>
        <input
          placeholder="Nome da nova categoria"
          value={novoNome}
          onChange={e => setNovoNome(e.target.value)}
        />
        <button type="submit" className="btn-novo">+ Criar categoria</button>
      </form>

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
        aberto={confirmarCriar}
        titulo="Criar categoria"
        mensagem={`Deseja criar a categoria "${novoNome}"?`}
        textoConfirmar="Sim, criar"
        onConfirmar={handleCriar}
        onCancelar={() => setConfirmarCriar(false)}
      />

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
