const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listAllModels() {
  try {
    // The listModels method is on the GoogleGenerativeAI instance in some versions?
    // Actually in @google/generative-ai it might be exported differently or not available as a simple method.
    // Let's try the fetch approach if the SDK doesn't have it.
    console.log('Using API Key:', process.env.GEMINI_API_KEY.substring(0, 5) + '...');
    
    // Most reliable way to check models is to try them. 
    // I'll try the known active ones.
    const candidates = [
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'gemini-2.0-flash-exp',
      'gemini-2.0-flash',
      'gemini-2.0-flash-001'
    ];

    for (const name of candidates) {
       try {
         const model = genAI.getGenerativeModel({ model: name });
         const result = await model.generateContent("test");
         console.log(`✅ ${name} works!`);
         return; // Found one!
       } catch (e) {
         console.log(`❌ ${name} failed: ${e.message}`);
       }
    }
  } catch (error) {
    console.error('Fatal Error:', error);
  }
}

listAllModels();
