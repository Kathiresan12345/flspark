const dotenv = require('dotenv');
const path = require('path');

// Load env vars from the root .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const { parseReceiptText, generateRecipesFromPantry } = require('../src/modules/recipe/gemini.service');

async function testAI() {
  console.log('🚀 Starting AI Integration Tests...');
  console.log('---');

  // 1. Test Receipt Parsing
  try {
    console.log('Testing Receipt Parsing...');
    const sampleOCR = `
      GROCERY STORE #123
      1% MILK 2L          $4.50
      LARGE EGGS 12CT     $3.99
      FRESH SPINACH BUNCH $2.50
      YELLOW ONION        $0.80
      TOTAL               $11.79
    `;
    
    console.log('Sending sample OCR to Gemini...');
    const parsedItems = await parseReceiptText(sampleOCR);
    
    console.log('✅ Receipt Parsing Successful!');
    console.log('Parsed Items:', JSON.stringify(parsedItems, null, 2));
  } catch (error) {
    console.error('❌ Receipt Parsing Failed:', error.message);
  }

  console.log('\n---\n');

  // 2. Test Recipe Generation
  try {
    console.log('Testing Recipe Generation...');
    const sampleIngredients = ['milk', 'eggs', 'spinach', 'onion'];
    
    console.log('Sending ingredients to Gemini:', sampleIngredients.join(', '));
    const recipes = await generateRecipesFromPantry(sampleIngredients);
    
    console.log('✅ Recipe Generation Successful!');
    console.log(`Generated ${recipes.length} recipes.`);
    console.log('First Recipe:', JSON.stringify(recipes[0], null, 2));
  } catch (error) {
    console.error('❌ Recipe Generation Failed:', error.message);
  }

  console.log('\n---');
  console.log('🏁 AI Integration Tests Finished.');
}

testAI();
