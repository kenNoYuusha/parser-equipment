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

/**
 * Resolves multi-kit matching assignment.
 * Grouping tools, batteries and chargers, checking correlative matches,
 * swapping them when a correlative matches the kit tool exactly,
 * and maintaining list of candidate kits for incomplete matches.
 */
export const resolverAsignacionMultiKits = (productosAnalizados, kits) => {
  if (!productosAnalizados || productosAnalizados.length === 0 || !kits || kits.length === 0) {
    return {};
  }

  // 1. Identify valid products and determine their roles (TOOL, BATTERY, CHARGER, UNKNOWN)
  const productosValidos = productosAnalizados.map((p, idx) => {
    if (!p || !p.valido || !p.model_na) return null;

    const modeloNorm = normalize(p.model_na);
    let rol = 'UNKNOWN';

    const esTool = kits.some(k => 
      [k.tool1, k.tool2, k.tool3, k.tool4, k.tool5].some(t => normalize(t) === modeloNorm)
    );
    const esBattery = kits.some(k => 
      [k.battery1, k.battery2, k.battery3, k.battery4, k.battery5, k.battery6, k.battery7, k.battery8].some(b => normalize(b) === modeloNorm)
    );
    const esCharger = kits.some(k => 
      [k.charger1, k.charger2, k.charger3].some(c => normalize(c) === modeloNorm)
    );

    if (esTool) rol = 'TOOL';
    else if (esBattery) rol = 'BATTERY';
    else if (esCharger) rol = 'CHARGER';

    return {
      index: idx,
      model_na: p.model_na,
      modeloNorm,
      correlativo: p.correlativo || '',
      rol,
      original: p
    };
  }).filter(Boolean);

  // 2. Identify active kit instances starting from TOOLS
  const herramientas = productosValidos.filter(p => p.rol === 'TOOL');
  
  if (herramientas.length === 0) {
    return {};
  }

  // Each tool initializes an active kit group
  const kitsActivos = herramientas.map(h => {
    const candidatosIniciales = kits.filter(k => 
      [k.tool1, k.tool2, k.tool3, k.tool4, k.tool5].some(t => normalize(t) === h.modeloNorm)
    );

    return {
      herramienta: h,
      correlativo: h.correlativo,
      candidatos: candidatosIniciales,
      componentesAsignados: [h], // tool is automatically assigned
      kitElegido: candidatosIniciales[0] || null,
      matchCompleto: false
    };
  });

  const componentesRestantes = productosValidos.filter(p => p.rol === 'BATTERY' || p.rol === 'CHARGER');

  // Helper to check if a kit can accommodate the assigned components
  const esViableParaAsignados = (kitBD, asignados) => {
    const freqAsignados = {};
    for (const comp of asignados) {
      freqAsignados[comp.modeloNorm] = (freqAsignados[comp.modeloNorm] || 0) + 1;
    }

    let reqs = kitBD.requirements;
    if (!reqs) {
      const kitComponents = [
        kitBD.tool1, kitBD.tool2, kitBD.tool3, kitBD.tool4, kitBD.tool5,
        kitBD.battery1, kitBD.battery2, kitBD.battery3, kitBD.battery4, 
        kitBD.battery5, kitBD.battery6, kitBD.battery7, kitBD.battery8,
        kitBD.charger1, kitBD.charger2, kitBD.charger3
      ]
      .map(c => normalize(c))
      .filter(c => c !== "");

      reqs = kitComponents.reduce((acc, comp) => {
        acc[comp] = (acc[comp] || 0) + 1;
        return acc;
      }, {});
    }

    for (const [modelo, cant] of Object.entries(freqAsignados)) {
      if ((reqs[modelo] || 0) < cant) {
        return false;
      }
    }
    return true;
  };

  // Helper to check if a kit is complete with the assigned components
  const esMatchCompleto = (kitBD, asignados) => {
    let reqs = kitBD.requirements;
    if (!reqs) {
      const kitComponents = [
        kitBD.tool1, kitBD.tool2, kitBD.tool3, kitBD.tool4, kitBD.tool5,
        kitBD.battery1, kitBD.battery2, kitBD.battery3, kitBD.battery4, 
        kitBD.battery5, kitBD.battery6, kitBD.battery7, kitBD.battery8,
        kitBD.charger1, kitBD.charger2, kitBD.charger3
      ]
      .map(c => normalize(c))
      .filter(c => c !== "");

      reqs = kitComponents.reduce((acc, comp) => {
        acc[comp] = (acc[comp] || 0) + 1;
        return acc;
      }, {});
    }

    const freqAsignados = {};
    for (const comp of asignados) {
      freqAsignados[comp.modeloNorm] = (freqAsignados[comp.modeloNorm] || 0) + 1;
    }

    const keysReq = Object.keys(reqs);
    const keysAsig = Object.keys(freqAsignados);
    if (keysReq.length !== keysAsig.length) return false;

    for (const m of keysReq) {
      if (reqs[m] !== freqAsignados[m]) return false;
    }
    return true;
  };

  // --- PASS 1: Exact Correlative Match ---
  // Assign components that have the exact same correlative as the active kit's tool
  // and are needed by the active kit.
  const asignadosPasada1 = new Set();

  for (const comp of componentesRestantes) {
    const kitsCompatiblesCorrelativo = kitsActivos.filter(ka => 
      ka.correlativo === comp.correlativo
    );

    for (const ka of kitsCompatiblesCorrelativo) {
      const nuevosAsignados = [...ka.componentesAsignados, comp];
      const nuevosCandidatos = ka.candidatos.filter(k => esViableParaAsignados(k, nuevosAsignados));

      if (nuevosCandidatos.length > 0) {
        ka.componentesAsignados = nuevosAsignados;
        ka.candidatos = nuevosCandidatos;
        ka.kitElegido = nuevosCandidatos[0];
        asignadosPasada1.add(comp.index);
        break; // Assigned to this active kit
      }
    }
  }

  // --- PASS 2: General Compatibility Match ---
  // Assign remaining components to active kits that need them and have viable candidates left.
  for (const comp of componentesRestantes) {
    if (asignadosPasada1.has(comp.index)) continue;

    for (const ka of kitsActivos) {
      const nuevosAsignados = [...ka.componentesAsignados, comp];
      const nuevosCandidatos = ka.candidatos.filter(k => esViableParaAsignados(k, nuevosAsignados));

      if (nuevosCandidatos.length > 0) {
        ka.componentesAsignados = nuevosAsignados;
        ka.candidatos = nuevosCandidatos;
        ka.kitElegido = nuevosCandidatos[0];
        break; // Assigned
      }
    }
  }

  // 3. Mark completeness for each kit active group
  for (const ka of kitsActivos) {
    if (ka.kitElegido) {
      ka.matchCompleto = esMatchCompleto(ka.kitElegido, ka.componentesAsignados);
    }
  }

  // 4. Build output mapping index -> active kit info
  const mapeoResultados = {};

  for (const ka of kitsActivos) {
    for (const comp of ka.componentesAsignados) {
      mapeoResultados[comp.index] = {
        kitAsociado: ka.kitElegido,
        matchCompleto: ka.matchCompleto,
        candidatos: ka.candidatos,
        herramientaIndex: ka.herramienta.index
      };
    }
  }

  return mapeoResultados;
};

