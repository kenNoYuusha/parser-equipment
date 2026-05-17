import { useState, useEffect } from 'react';
import { cargarDiccionarioModelos, enriquecerNumeroSerie } from '../services/fetchModels';

/**
 * Hook personalizado para gestionar el estado de la base de datos de modelos.
 * @returns {Object} { diccionarioModelos, cargando, error, enriquecerNumeroSerie }
 */
export const useModels = () => {
  const [diccionarioModelos, setDiccionarioModelos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    cargarDiccionarioModelos()
      .then((data) => {
        if (isMounted) {
          setDiccionarioModelos(data);
          setCargando(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || "Error al cargar la base de datos.");
          setCargando(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  return {
    diccionarioModelos,
    cargando,
    error,
    enriquecerNumeroSerie
  };
};
