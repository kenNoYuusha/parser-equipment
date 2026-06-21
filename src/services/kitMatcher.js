/**
 * kitMatcher.js
 * Optimizado para permitir códigos extra en el inventario del usuario
 * siempre que se cumplan los componentes mínimos exigidos por el Kit.
 */

const normalize = (str) => {
  if (!str) return "";
  return str.toString().trim().replace(/\s+/g, '').toUpperCase();
};

/**
 * Creates a frequency map of models from analyzed products.
 * @param {Array} productosAnalizados 
 * @returns {Object} { MODEL_NA: count }
 */
const getInventory = (productosAnalizados) => {
  return productosAnalizados
    .filter(p => p?.valido && p.model_na)
    .reduce((acc, p) => {
      const model = normalize(p.model_na);
      acc[model] = (acc[model] || 0) + 1;
      return acc;
    }, {});
};

/**
 * Matches user inventory against a Kit row.
 * Permite que el usuario tenga componentes adicionales (herramientas/baterías/cargadores de más).
 * @param {Object} inventory - { MODEL: count }
 * @param {Object} kitRow - Row from Excel
 * @returns {boolean}
 */
const isMatch = (inventory, kitRow) => {
  // Extract all potential component columns
  const kitComponents = [
    kitRow.tool1, kitRow.tool2, kitRow.tool3, kitRow.tool4, kitRow.tool5,
    kitRow.battery1, kitRow.battery2, kitRow.battery3, kitRow.battery4, 
    kitRow.battery5, kitRow.battery6, kitRow.battery7, kitRow.battery8,
    kitRow.charger1, kitRow.charger2, kitRow.charger3
  ]
  .map(c => normalize(c))
  .filter(c => c !== "");

  if (kitComponents.length === 0) return false;

  // Create frequency map for the Kit row (Requisitos mínimos del kit)
  const kitRequirements = kitComponents.reduce((acc, comp) => {
    acc[comp] = (acc[comp] || 0) + 1;
    return acc;
  }, {});

  const kitModels = Object.keys(kitRequirements);

  // NUEVA LÓGICA: Comprobar si el usuario cumple con CADA UNO de los requisitos del kit.
  for (const model of kitModels) {
    // Si el usuario ni siquiera tiene el modelo que el kit pide, NO hay match
    if (!inventory[model]) return false;
    
    // Si el usuario tiene el modelo, pero en una cantidad MENOR a la requerida por el kit, NO hay match
    if (inventory[model] < kitRequirements[model]) return false;
  }

  // Si pasó el bucle anterior, significa que tiene todo lo necesario (y tal vez más). ¡Es un Match!
  return true;
};

/**
 * Finds a matching kit from the database.
 * @param {Array} productosAnalizados 
 * @param {Array} kitsData 
 * @returns {Object|null} The full kit object or null.
 */
export const findMatchingKit = (productosAnalizados, kitsData) => {
  if (!productosAnalizados?.length || !kitsData?.length) return null;

  const inventory = getInventory(productosAnalizados);
  
  // Guard clause: if no valid products, no kit.
  if (Object.keys(inventory).length === 0) return null;

  for (const kit of kitsData) {
    if (isMatch(inventory, kit)) {
      return kit;
    }
  }

  return null;
};