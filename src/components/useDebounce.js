import { useState, useEffect } from "react";

export function useDebounce(valor, atraso = 400) {
  const [debounced, setDebounced] = useState(valor);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(valor), atraso);
    return () => clearTimeout(timer);
  }, [valor, atraso]);

  return debounced;
}
