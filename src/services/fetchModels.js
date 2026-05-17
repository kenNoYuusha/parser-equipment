import Papa from 'papaparse';
import descomponerNumeroSerie from '../utils/parseador';
import { formatearFechaSerial } from '../utils/conversorFechas';

// URL de Google Sheets (formato TSV/CSV)
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ74YRCmDIVupviaj7YYegoaOHlN3Db0DvWZri0CpjheobakvnFt0rnFV4OEXWVtZkIDoww3SBav5oy/pub?gid=0&single=true&output=tsv";

/**
 * Carga el diccionario de modelos desde la fuente de datos externa.
 * @returns {Promise<Object>} Diccionario indexado por modelo_id.
 */
export const cargarDiccionarioModelos = async () => {
  try {
    const response = await fetch(SHEET_URL);
    if (!response.ok) throw new Error('Fallo en la conexión con la base de datos de modelos.');
    
    const text = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const diccionario = results.data.reduce((acc, fila) => {
            if (fila.model_id) {
              acc[fila.model_id] = {
                categoria: fila.category || 'No disponible',
                producto: fila.product|| 'No disponible',
                model_na: fila.model_na || 'No disponible'
              };
            }
            return acc;
          }, {});
          resolve(diccionario);
        },
        error: (error) => reject(error)
      });
    });
  } catch (error) {
    console.error("Error en el servicio de modelos:", error);
    throw error;
  }
};

/**
 * Función integradora que combina el análisis técnico con la información comercial.
 * @param {string} numeroSerie - Serial a procesar.
 * @param {Object} diccionarioModelos - Base de datos de modelos cargada.
 * @returns {Object} Objeto enriquecido con datos comerciales.
 */
export const enriquecerNumeroSerie = (numeroSerie, diccionarioModelos) => {
  const analizado = descomponerNumeroSerie(numeroSerie);
  
  // Si no hay diccionario aún o el análisis falló estructuralmente
  if (!diccionarioModelos || !analizado.valido) {
    return { ...analizado, datosComerciales: null, fechaFormateada: "Invalid Date" };
  }

  const datosComerciales = diccionarioModelos[analizado.modelo] || null;
  const fechaFormateada = formatearFechaSerial(analizado.fecha);

  return {
    ...analizado,
    datosComerciales,
    fechaFormateada
  };
};
