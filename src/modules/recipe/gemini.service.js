const { getGeminiModel } = require('../../config/gemini');

const model = getGeminiModel();

const parseReceiptText = async (ocrText) => {
  const prompt = `
    You are a grocery receipt parser.
    Convert the following OCR text into valid JSON.
    Each item must contain:
    item_name, normalized_name, quantity, unit, category, confidence_score.
    Only return valid JSON array.

    OCR TEXT:
    ${ocrText}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Attempt to extract JSON if Gemini wraps it in markdown blocks
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from Gemini response');
    }
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Gemini Receipt Parsing Error:', error);
    throw error;
  }
};

const generateRecipesFromPantry = async (ingredients) => {
  const prompt = `
    Generate 5 simple home-cooking recipes using these pantry ingredients:
    ${ingredients.join(', ')}.

    Return valid JSON array with:
    title, description, ingredients, instructions, cooking_time_minutes, difficulty_level.
    Include a "missing_ingredients" field if some common staples are needed but not in the list.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from Gemini response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('Gemini Recipe Generation Error:', error);
    throw error;
  }
};

module.exports = {
  parseReceiptText,
  generateRecipesFromPantry,
};
