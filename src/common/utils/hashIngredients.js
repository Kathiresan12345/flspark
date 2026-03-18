const crypto = require('crypto');

/**
 * Creates a unique hash for a list of ingredients.
 * @param {string[]} ingredients 
 * @returns {string} SHA256 hash
 */
const hashIngredients = (ingredients) => {
  // 1. normalize (lowercase, trim)
  // 2. deduplicate
  // 3. sort alphabetically
  // 4. join and hash
  
  const processed = [...new Set(ingredients.map(i => i.toLowerCase().trim()))].sort();
  return crypto.createHash('sha256').update(processed.join('|')).digest('hex');
};

module.exports = hashIngredients;
