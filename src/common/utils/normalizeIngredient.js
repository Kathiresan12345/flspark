/**
 * Normalizes ingredient names for better matching.
 * @param {string} name 
 * @returns {string}
 */
const normalizeIngredient = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // remove double spaces
    .replace(/[^a-z0-9\s]/g, ''); // remove special chars
};

module.exports = normalizeIngredient;
