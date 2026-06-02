import "./Loading.css";

export default function Loading({ texto = "Carregando..." }) {
  return (
    <div className="loading-wrap">
      <div className="loading-spinner" />
      <p className="loading-texto">{texto}</p>
    </div>
  );
}
