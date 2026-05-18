/**
 * kitMatcher.js
 * Specialized service to match a list of analyzed products against a Kits reference database.
 * Implement "Strict Matching": ALL components defined in a kit row must be present in user inputs.
 */

/**
 * Normalizes a string by removing all internal and external spaces and converting to UPPERCASE.
 * @param {string} str 
 * @returns {string}
 */
const normalize = (str) => {
  if (!str) return "";
  return str.toString().trim().replace(/\s+/g, '').toUpperCase();
};

/**
 * Process analyzed products to create a set of comparison tokens.
 * Handles the multiplier logic for Batteries (BA) and Chargers (CH).
 * 
 * @param {Array} productosAnalizados - Array of objects from the UI.
 * @returns {Set<string>} A set of normalized tokens.
 */
const getComparisonTokens = (productosAnalizados) => {
  const validProducts = productosAnalizados
    .filter(p => p?.valido && p.model_na)
    .map(p => normalize(p.model_na));

  const counts = validProducts.reduce((acc, model) => {
    acc[model] = (acc[model] || 0) + 1;
    return acc;
  }, {});

  const tokens = Object.entries(counts).map(([model, count]) => {
    const isMultiplierCandidate = model.startsWith('BA') || model.startsWith('CH');
    if (count > 1 && isMultiplierCandidate) {
      return `${count}X${model}`;
    }
    return model;
  });

  return new Set(tokens);
};

/**
 * Matches user inputs against the Kits database using STRICT logic.
 * Rule: The number of matches must EXACTLY EQUAL the number of non-empty component columns in the row.
 * 
 * @param {Array} productosAnalizados - User's current inputs.
 * @param {Array} kitsData - Reference table from Google Sheets.
 * @returns {string|null} The model_id of the matching kit, or null.
 */
export const findMatchingKit = (productosAnalizados, kitsData) => {
  if (!productosAnalizados?.length || !kitsData?.length) return null;

  const userTokens = getComparisonTokens(productosAnalizados);

  for (const kit of kitsData) {
    // Identify component columns
    const rawComponents = [
      kit.tool1 || kit.Tool1,
      kit.tool2 || kit.Tool2,
      kit.tool3 || kit.Tool3,
      kit.battery || kit.Battery,
      kit.charger || kit.Charger
    ];

    // Normalize and filter out empty columns to get required components
    const requiredComponents = rawComponents
      .map(c => normalize(c))
      .filter(c => c !== "");

    if (requiredComponents.length === 0) continue;

    // Count matches
    const matchesCount = requiredComponents.filter(comp => userTokens.has(comp)).length;

    // STRICT MATCH: All required components in this row must be present in user tokens
    if (matchesCount === requiredComponents.length) {
      return kit.model_id || kit["Model #"] || kit.model_na;
    }
  }

  return null;
};

/**
 * Mock data for demonstration of Strict Matching.
 */
export const MOCK_KITS_DATA = [
  {
    model_id: "STRICT-KIT-3-COMP", // Requires 3 matches
    tool1: "LM2100SP",
    battery: "2XBA4200T",
    charger: "CH5500",
    tool2: "",
    tool3: ""
  },
  {
    model_id: "STRICT-KIT-2-COMP", // Requires 2 matches
    tool1: "LB6500",
    battery: "BA2800",
    tool2: "",
    tool3: "",
    charger: ""
  }
];
