/**
 * AntiqueAI - Gemini Vision Capability Test
 * 
 * This script tests Gemini 2.5 Flash's ability to:
 * 1. Identify antiques and artifacts from images
 * 2. Provide authenticity verification tips
 * 3. Give historical context and valuation guidance
 */

import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

async function testAntiqueIdentification(imagePath) {
    console.log('\n🔍 Testing Antique Identification with Gemini 2.5 Flash...\n');

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Read image and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';

    const prompt = `You are an expert antique appraiser and authenticator. Analyze this image and provide:

1. **IDENTIFICATION**: What is this item? Include:
   - Type of object
   - Estimated time period/era
   - Style or design movement (if applicable)
   - Materials used

2. **AUTHENTICITY CHECKS**: Specific things to look for to verify if this is genuine:
   - Key markers of authenticity
   - Common reproduction red flags
   - What to examine closely (marks, construction, materials)
   - Tools or tests that could help verify

3. **HISTORICAL CONTEXT**: Brief background on:
   - Origin and purpose
   - Why it's collectible
   - Notable manufacturers or makers (if identifiable)

4. **VALUE INDICATORS**: Factors that affect value:
   - Condition assessment from what's visible
   - Rarity indicators
   - Market demand factors
   - Estimated value range (if possible from image alone)

5. **EXPERT TIPS**: What a collector should know:
   - Where to find similar items
   - What documentation to look for
   - Professional appraisal recommendations

Be specific, practical, and focus on actionable advice. If you cannot definitively identify something from the image, explain what additional angles or details would help.`;

    try {
        const startTime = Date.now();

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{
                parts: [
                    { inlineData: { data: base64Image, mimeType } },
                    { text: prompt }
                ]
            }]
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        console.log('✅ RESPONSE RECEIVED\n');
        console.log('━'.repeat(80));
        console.log(response.text);
        console.log('━'.repeat(80));
        console.log(`\n⏱️  Response time: ${responseTime}ms`);
        console.log(`💰 Estimated cost: ~$0.001-0.002 per analysis`);

        return {
            success: true,
            response: response.text,
            responseTime,
            model: 'gemini-2.5-flash'
        };

    } catch (error) {
        console.error('❌ ERROR:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Test with sample image
const testImagePath = process.argv[2];

if (!testImagePath) {
    console.log('Usage: node test-antique-vision.js <path-to-image>');
    console.log('\nExample: node test-antique-vision.js ./sample-antique.jpg');
    process.exit(1);
}

if (!fs.existsSync(testImagePath)) {
    console.error(`❌ Image not found: ${testImagePath}`);
    process.exit(1);
}

testAntiqueIdentification(testImagePath)
    .then(result => {
        if (result.success) {
            console.log('\n✅ TEST PASSED - Gemini can identify antiques and provide authentication guidance!');
            process.exit(0);
        } else {
            console.log('\n❌ TEST FAILED');
            process.exit(1);
        }
    });
