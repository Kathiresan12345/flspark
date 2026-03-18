const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    // There isn't a direct listModels in the SDK easily accessible without extra work
    // But we can try a few standard ones
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.5-flash-latest'];
    
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hi");
        console.log(`✅ Model ${modelName} is AVAILABLE`);
      } catch (e) {
        console.log(`❌ Model ${modelName} returned error: ${e.message}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

listModels();
