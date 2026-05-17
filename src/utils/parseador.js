/**
 * Módulo de lógica para la descomposición y análisis de números de serie.
 * Este módulo está diseñado para ser utilizado en aplicaciones de React/Vite.
 */

/**
 * Descompone un número de serie en sus componentes constitutivos basándose en
 * reglas de posición, patrones de caracteres y flags de estado.
 *
 * @param {string} codigo - El número de serie a analizar.
 * @returns {Object} Un objeto con la información desglosada y el estado de validación.
 */
export default function descomponerNumeroSerie(codigo) {
  // Inicializamos el objeto de respuesta
  const resultado = {
    esRefurbished: false,
    letraMercadeo: 'No especificado',
    modelo: '',
    fecha: '',
    correlativo: '',
    letraFinal: '',
    valido: false
  };

  if (!codigo || typeof codigo !== 'string') {
    return resultado;
  }

  let tempCodigo = codigo.trim();

  // 1. Estatus Refurbished: Verificar si empieza o termina con 'R'
  // Si empieza con 'R', se marca y se remueve del inicio para el análisis limpio.
  // Si termina con 'R', se marca (frecuente en algunos procesos de etiquetado).
  if (tempCodigo.toUpperCase().endsWith('R')) {
    resultado.esRefurbished = true;
    tempCodigo = tempCodigo.slice(0, -1);
  }
  
  if (tempCodigo.toUpperCase().startsWith('R')) {
    resultado.esRefurbished = true;
    tempCodigo = tempCodigo.slice(1);
  }

  /**
   * Expresión Regular para los Bloques Fijos:
   * ^([A-Z](?=[A-Z]{2}\d{2}))?  -> Letra de Mercadeo opcional (solo si le siguen 2 letras y 2 números)
   * ([A-Z]{2}\d{2})             -> Modelo: 2 letras y 2 números (ej: JK15)
   * (\d{4})                     -> Fecha: 4 dígitos (ej: 1815)
   * (\d{5})                     -> Correlativo: 5 dígitos (ej: 00001)
   * ([A-Z])                     -> Letra Final: 1 carácter de relleno (ej: X)
   * $                           -> Fin de cadena
   */
  const patron = /^([A-Z](?=[A-Z]{2}\d{2}))?([A-Z]{2}\d{2})(\d{4})(\d{5})([A-Z])$/i;
  const match = tempCodigo.match(patron);

  if (match) {
    const letraEncontrada = match[1];

    // Nueva Regla: Si NO es refurbished, la letra de mercadeo es OBLIGATORIA.
    // Si es refurbished, puede venir o no (No especificado).
    if (!resultado.esRefurbished && !letraEncontrada) {
      resultado.valido = false;
    } else {
      resultado.valido = true;
      resultado.letraMercadeo = letraEncontrada || 'No especificado';
      resultado.modelo = match[2].toUpperCase();
      resultado.fecha = match[3];
      resultado.correlativo = match[4];
      resultado.letraFinal = match[5].toUpperCase();
    }
  }

  return resultado;
}

/*
// Ejemplos de prueba para verificar el funcionamiento:

console.log("Caso Normal (con M):", descomponerNumeroSerie("MJK15181500001X"));
// Esperado: esRefurbished: false, letraMercadeo: 'M', valido: true

console.log("Caso Normal SIN M (Inválido):", descomponerNumeroSerie("JK15181500001X"));
// Esperado: esRefurbished: false, valido: false (porque no es refurbished y falta la letra)

console.log("Caso R al inicio con M:", descomponerNumeroSerie("RMJK15181500001X"));
// Esperado: esRefurbished: true, letraMercadeo: 'M', valido: true

console.log("Caso R al inicio sin M:", descomponerNumeroSerie("RJK15181500001X"));
// Esperado: esRefurbished: true, letraMercadeo: 'No especificado', valido: true

console.log("Caso R al final:", descomponerNumeroSerie("MJK15181500001XR"));
// Esperado: esRefurbished: true, letraMercadeo: 'M', valido: true
*/
