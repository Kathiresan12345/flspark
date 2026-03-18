const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testFinal() {
  const modelName = 'gemini-1.5-flash-8b';
  console.log(`Testing model: ${modelName}`);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say hello");
    console.log(`✅ ${modelName} works! Result:`, await result.response.text());
  } catch (e) {
    console.log(`❌ ${modelName} failed: ${e.message}`);
  }
}

testFinal();
