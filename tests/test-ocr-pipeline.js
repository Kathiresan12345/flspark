const vision = require('@google-cloud/vision');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testOCR(imagePath) {
  console.log('🔍 Starting OCR & External API Tests...');
  console.log('---');

  // 1. Google Cloud Vision OCR Test
  const client = new vision.ImageAnnotatorClient({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });

  try {
    console.log(`Step 1: Testing Google Vision OCR with image: ${imagePath}`);
    if (!fs.existsSync(imagePath)) {
        throw new Error(`Test image not found at ${imagePath}`);
    }

    const [result] = await client.textDetection(imagePath);
    const detections = result.textAnnotations;
    
    if (detections.length > 0) {
      console.log('✅ Google Vision OCR Successful!');
      console.log('Raw OCR Output (First 200 chars):');
      console.log(detections[0].description.substring(0, 200) + '...');
    } else {
      console.log('⚠️ Google Vision OCR reached successfully, but no text was detected in the image.');
    }
  } catch (error) {
    console.error('❌ Google Vision OCR Failed:', error.message);
    if (error.message.includes('ENOENT')) {
        console.error('Tip: Make sure the GOOGLE_APPLICATION_CREDENTIALS path in .env is correct and the file exists.');
    }
  }

  console.log('\n---\n');

  // 2. Spoonacular API Test
  const spoonacularKey = process.env.SPOONACULAR_API_KEY;
  try {
    console.log('Step 2: Testing Spoonacular API Connection...');
    const ingredient = 'apple';
    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredient}&number=1&apiKey=${spoonacularKey}`;
    
    const response = await axios.get(url);
    if (response.status === 200) {
      console.log('✅ Spoonacular API Connection Successful!');
      console.log(`Found ${response.data.length} recipe(s) for "${ingredient}".`);
      if (response.data.length > 0) {
          console.log('Sample Recipe Title:', response.data[0].title);
      }
    }
  } catch (error) {
    console.error('❌ Spoonacular API Test Failed:', error.response ? error.response.data : error.message);
  }

  console.log('\n---');
  console.log('🏁 OCR & External API Tests Finished.');
}

// Automatically use the generated image path from the previous step if available.
// If running manually, replace this path with your test image path.
const testImagePath = process.argv[2] || path.join(__dirname, '../sample_receipt.png'); 

testOCR(testImagePath);
