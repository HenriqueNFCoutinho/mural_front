import { useState } from "react";
import { StarsDisplay } from "./Stars";
import { editarAvaliacao, deletarAvaliacao, meuId, ehAdmin } from "../services/api";
import { useToast } from "./Toast";
import "./ListaAvaliacoes.css";

function StarsInput({ nota, setNota }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="av-edit-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <button key={i} type="button"
          className={`av-edit-star${i <= (hover || nota) ? " ativa" : ""}`}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => setNota(i)}>★</button>
      ))}
    </div>
  );
}

export default function ListaAvaliacoes({ avaliacoes, setAvaliacoes }) {
  const toast = useToast();
  const idUsuario = meuId() ? Number(meuId()) : null;
  const isAdmin = ehAdmin();

  const [editandoId, setEditandoId] = useState(null);
  const [notaEdit, setNotaEdit] = useState(0);
  const [comentarioEdit, setComentarioEdit] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [confirmarDeletar, setConfirmarDeletar] = useState(null);

  function podeGerenciar(av) {
    return isAdmin || (idUsuario && av.usuario_id === idUsuario);
  }

  function abrirEditar(av) {
    setEditandoId(av.id);
    setNotaEdit(av.nota);
    setComentarioEdit(av.comentario || "");
  }

  function cancelarEditar() {
    setEditandoId(null);
    setNotaEdit(0);
    setComentarioEdit("");
  }

  async function handleSalvar(avId) {
    if (notaEdit === 0) { toast("Selecione uma nota.", "erro"); return; }
    setSalvando(true);
    try {
      const atualizada = await editarAvaliacao(avId, { nota: notaEdit, comentario: comentarioEdit });
      setAvaliacoes(prev => prev.map(a => a.id === avId
        ? { ...a, nota: atualizada.nota ?? notaEdit, comentario: atualizada.comentario ?? comentarioEdit }
        : a
      ));
      cancelarEditar();
      toast("Avaliação atualizada!", "sucesso");
    } catch (err) {
      toast(err?.erro || "Erro ao editar avaliação.", "erro");
    } finally {
      setSalvando(false);
    }
  }

  async function handleDeletar(avId) {
    try {
      await deletarAvaliacao(avId);
      setAvaliacoes(prev => prev.filter(a => a.id !== avId));
      setConfirmarDeletar(null);
      toast("Avaliação removida.", "info");
    } catch (err) {
      toast(err?.erro || "Erro ao remover avaliação.", "erro");
    }
  }

  if (!avaliacoes || avaliacoes.length === 0) {
    return (
      <div className="avaliacoes-vazio">
        <p>Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
      </div>
    );
  }

  const media = avaliacoes.reduce((acc, a) => acc + a.nota, 0) / avaliacoes.length;

  return (
    <div className="avaliacoes-lista">
      <div className="avaliacoes-resumo">
        <span className="avaliacoes-media">{media.toFixed(1)}</span>
        <div>
          <StarsDisplay value={media} />
          <p className="avaliacoes-total">{avaliacoes.length} avaliação{avaliacoes.length !== 1 ? "ões" : ""}</p>
        </div>
      </div>

      {avaliacoes.map(a => (
        <div key={a.id} className="avaliacao-item">
          {editandoId === a.id ? (
            /* ---- modo edição ---- */
            <div className="av-edit-form">
              <StarsInput nota={notaEdit} setNota={setNotaEdit} />
              <textarea
                className="av-edit-textarea"
                value={comentarioEdit}
                onChange={e => setComentarioEdit(e.target.value)}
                placeholder="Comentário (opcional)..."
                rows={3}
              />
              <div className="av-edit-acoes">
                <button className="av-btn-salvar" onClick={() => handleSalvar(a.id)} disabled={salvando}>
                  {salvando ? "Salvando..." : "Salvar"}
                </button>
                <button className="av-btn-cancelar" onClick={cancelarEditar}>Cancelar</button>
              </div>
            </div>
          ) : confirmarDeletar === a.id ? (
            /* ---- confirmação de deletar ---- */
            <div className="av-confirm-row">
              <span className="av-confirm-texto">Remover esta avaliação?</span>
              <button className="av-btn-sim" onClick={() => handleDeletar(a.id)}>Sim, remover</button>
              <button className="av-btn-nao" onClick={() => setConfirmarDeletar(null)}>Cancelar</button>
            </div>
          ) : (
            /* ---- exibição normal ---- */
            <>
              <div className="avaliacao-item-top">
                <StarsDisplay value={a.nota} />
                <div className="av-acoes-row">
                  <span className="avaliacao-data">
                    {a.criado_em ? new Date(a.criado_em).toLocaleDateString("pt-BR") : ""}
                  </span>
                  {podeGerenciar(a) && (
                    <>
                      <button className="av-btn-icon" title="Editar" onClick={() => abrirEditar(a)}>✏️</button>
                      <button className="av-btn-icon av-btn-del" title="Excluir" onClick={() => setConfirmarDeletar(a.id)}>🗑️</button>
                    </>
                  )}
                </div>
              </div>
              {a.comentario && <p className="avaliacao-comentario">{a.comentario}</p>}
            </>
          )}
        </div>
      ))}
    </div>
  );
}
