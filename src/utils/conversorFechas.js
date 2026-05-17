/**
 * Utility for converting manufacturing date codes into human-readable strings.
 * Based on hybrid business rules:
 * - Pre-2019: Code represents Month.
 * - 2019: Hybrid (<=12 is Month, >12 is Week).
 * - Post-2019: Code represents Week (ISO 8601 start date).
 */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/**
 * Calculates the Monday of a given week and year.
 * Follows ISO 8601 standard logic.
 * @param {number} week - Week number (1-53).
 * @param {number} year - Full year (e.g., 2021).
 * @returns {Date}
 */
const getMondayOfISOWeek = (week, year) => {
  // ISO 8601: Week 1 is the week with the first Thursday of the year.
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay(); // 0 (Sun) to 6 (Sat)
  // Get Monday of that week
  const mondayOfFirstWeek = new Date(jan4);
  mondayOfFirstWeek.setDate(jan4.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  
  const targetMonday = new Date(mondayOfFirstWeek);
  targetMonday.setDate(mondayOfFirstWeek.getDate() + (week - 1) * 7);
  
  return targetMonday;
};

/**
 * Formats a 4-digit date code.
 * @param {string} codigoFecha - 4 digit string (e.g., "1944").
 * @returns {string} Human readable date or "Invalid Date".
 */
export const formatearFechaSerial = (codigoFecha) => {
  if (!codigoFecha || codigoFecha.length !== 4 || isNaN(codigoFecha)) {
    return "Invalid Date";
  }

  const yy = parseInt(codigoFecha.substring(0, 2), 10);
  const val = parseInt(codigoFecha.substring(2, 4), 10);
  const fullYear = 2000 + yy;

  // Rule 1: <= 2018 is always Month
  if (fullYear <= 2018) {
    if (val < 1 || val > 12) return "Invalid Date";
    return `${MONTHS[val - 1]} ${fullYear}`;
  }

  // Rule 2: 2019 is Hybrid
  if (fullYear === 2019) {
    if (val <= 12) {
      if (val < 1) return "Invalid Date";
      return `${MONTHS[val - 1]} ${fullYear}`;
    }
  }

  // Rule 3: >= 2020 (and 2019 > 12) is Week
  if (val < 1 || val > 53) return "Invalid Date";
  
  const monday = getMondayOfISOWeek(val, fullYear);
  
  return monday.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  });
};
