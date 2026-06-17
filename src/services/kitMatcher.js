/**
 * kitMatcher.js
 * Optimized for the new Excel structure with individual columns for Tools, Batteries, and Chargers.
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

  // Create frequency map for the Kit row
  const kitRequirements = kitComponents.reduce((acc, comp) => {
    acc[comp] = (acc[comp] || 0) + 1;
    return acc;
  }, {});

  // Check if every requirement in the kit is met by the user inventory
  // AND if the user doesn't have extra items that aren't in the kit? 
  // User said: "match entre todas las tools todas las baterias y todos lo chargers"
  // Usually this means the sets must be identical.
  
  const userModels = Object.keys(inventory);
  const kitModels = Object.keys(kitRequirements);

  if (userModels.length !== kitModels.length) return false;

  for (const model of kitModels) {
    if (inventory[model] !== kitRequirements[model]) return false;
  }

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
