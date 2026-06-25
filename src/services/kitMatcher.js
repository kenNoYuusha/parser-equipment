/**
 * kitMatcher.js
 * Optimized for the new Excel structure with individual columns for Tools, Batteries, and Chargers.
 */

const normalize = (str) => {
  if (!str) return "";
  return str.toString().trim().replace(/\s+/g, '').toUpperCase();
};

/**
 * Pre-processes a kits list by compiling requirements into frequency maps.
 * Run once when kits database is loaded to avoid repeated calculations on render.
 * @param {Array} kitsData 
 * @returns {Array} Kits list with pre-calculated requirements maps
 */
export const preprocessKits = (kitsData) => {
  if (!Array.isArray(kitsData)) return [];
  return kitsData.map(kit => {
    const kitComponents = [
      kit.tool1, kit.tool2, kit.tool3, kit.tool4, kit.tool5,
      kit.battery1, kit.battery2, kit.battery3, kit.battery4, 
      kit.battery5, kit.battery6, kit.battery7, kit.battery8,
      kit.charger1, kit.charger2, kit.charger3
    ]
    .map(c => normalize(c))
    .filter(c => c !== "");

    const requirements = kitComponents.reduce((acc, comp) => {
      acc[comp] = (acc[comp] || 0) + 1;
      return acc;
    }, {});

    return {
      ...kit,
      requirements
    };
  });
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
  let reqs = kitRow.requirements;

  // Fallback: If requirements are not pre-calculated, calculate them on the fly
  if (!reqs) {
    const kitComponents = [
      kitRow.tool1, kitRow.tool2, kitRow.tool3, kitRow.tool4, kitRow.tool5,
      kitRow.battery1, kitRow.battery2, kitRow.battery3, kitRow.battery4, 
      kitRow.battery5, kitRow.battery6, kitRow.battery7, kitRow.battery8,
      kitRow.charger1, kitRow.charger2, kitRow.charger3
    ]
    .map(c => normalize(c))
    .filter(c => c !== "");

    reqs = kitComponents.reduce((acc, comp) => {
      acc[comp] = (acc[comp] || 0) + 1;
      return acc;
    }, {});
  }

  const userModels = Object.keys(inventory);
  const kitModels = Object.keys(reqs);

  if (userModels.length !== kitModels.length) return false;

  for (const model of kitModels) {
    if (inventory[model] !== reqs[model]) return false;
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

