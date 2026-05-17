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
    codigoOriginal: codigo,
    isRefurbished: false,
    letraMercadeo: 'Not specified',
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
  if (tempCodigo.toUpperCase().endsWith('R')) {
    resultado.isRefurbished = true;
    tempCodigo = tempCodigo.slice(0, -1);
  }
  
  if (tempCodigo.toUpperCase().startsWith('R')) {
    resultado.isRefurbished = true;
    tempCodigo = tempCodigo.slice(1);
  }

  /**
   * Expresión Regular para los Bloques Fijos:
   * ^([A-Z](?=[A-Z]{2}\d{2}))?  -> Letra de Mercadeo opcional
   * ([A-Z]{2}\d{2})             -> Modelo: 2 letras y 2 números (ej: JK15)
   * (\d{4})                     -> Fecha: 4 dígitos (ej: 1815)
   * (\d{5})                     -> Correlativo: 5 dígitos (ej: 00001)
   * ([A-Z])                     -> Letra Final: 1 carácter de relleno (ej: X)
   */
  const patron = /^([A-Z](?=[A-Z]{2}\d{2}))?([A-Z]{2}\d{2})(\d{4})(\d{5})([A-Z])$/i;
  const match = tempCodigo.match(patron);

  if (match) {
    const letraEncontrada = match[1];

    if (!resultado.isRefurbished && !letraEncontrada) {
      resultado.valido = false;
    } else {
      resultado.valido = true;
      resultado.letraMercadeo = letraEncontrada || 'Not specified';
      resultado.modelo = match[2].toUpperCase();
      resultado.fecha = match[3];
      resultado.correlativo = match[4];
      resultado.letraFinal = match[5].toUpperCase();
    }
  }

  return resultado;
}
