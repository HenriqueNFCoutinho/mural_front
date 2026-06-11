import { createContext, useContext, useState, useCallback } from "react";
import "./Toast.css";

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((mensagem, tipo = "sucesso") => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, mensagem, tipo }]);
    setTimeout(() => {
      setToasts(t => t.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.tipo}`}>
            <span className="toast-icon">
              {t.tipo === "sucesso" ? "✓" : t.tipo === "erro" ? "✕" : "ℹ"}
            </span>
            <span className="toast-msg">{t.mensagem}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
