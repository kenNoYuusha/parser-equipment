import { useState, useEffect } from 'react';
import { cargarDiccionarioModelos, cargarKits, enriquecerNumeroSerie } from '../services/fetchModels';

/**
 * Hook personalizado para gestionar el estado de la base de datos de modelos
 * y el acumulador de productos analizados por lotes.
 */
export const useModels = () => {
  const [diccionarioModelos, setDiccionarioModelos] = useState(null);
  const [kits, setKits] = useState([]);
  const [productosAnalizados, setProductosAnalizados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    Promise.all([cargarDiccionarioModelos(), cargarKits()])
      .then(([modelosData, kitsData]) => {
        if (isMounted) {
          setDiccionarioModelos(modelosData);
          setKits(kitsData);
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

  /**
   * Actualiza o limpia un producto en el array acumulador basándose en su índice.
   * @param {number} index - Posición en el array.
   * @param {string} numeroSerie - Serial a analizar.
   */
  const actualizarProductoAnalizado = (index, numeroSerie) => {
    setProductosAnalizados(prev => {
      const nuevoEstado = [...prev];
      
      if (!numeroSerie.trim()) {
        nuevoEstado[index] = { index, valido: false };
        return nuevoEstado;
      }

      const datos = enriquecerNumeroSerie(numeroSerie, diccionarioModelos);

      if (datos.valido && datos.datosComerciales) {
        nuevoEstado[index] = {
          index,
          model_na: datos.datosComerciales.model_na,
          correlativo: datos.correlativo,
          valido: true,
          resultadoCompleto: datos
        };
      } else {
        nuevoEstado[index] = { index, valido: false };
      }

      return nuevoEstado;
    });
  };

  /**
   * Elimina un producto del acumulador.
   * @param {number} index - Índice a eliminar.
   */
  const eliminarProductoAnalizado = (index) => {
    setProductosAnalizados(prev => {
      const nuevoEstado = prev.filter((_, i) => i !== index);
      // Re-indexar para mantener coherencia visual en las mini-cards
      return nuevoEstado.map((item, i) => ({ ...item, index: i }));
    });
  };

  /**
   * Limpia todos los resultados analizados.
   */
  const resetearProductosAnalizados = () => {
    setProductosAnalizados([]);
  };

  return {
    diccionarioModelos,
    kits,
    productosAnalizados,
    cargando,
    error,
    actualizarProductoAnalizado,
    eliminarProductoAnalizado,
    resetearProductosAnalizados,
    enriquecerNumeroSerie
  };
};
