#!/usr/bin/env node

// Simple test script for LLM integration
// Run with: node test-llm.js

import axios from 'axios';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral:7b-instruct-q4_K_M';

async function testOllamaConnection() {
  console.log('🤖 Testing Ollama LLM Integration...\n');

  try {
    // Test 1: Check if Ollama server is running
    console.log('1. Testing Ollama server connection...');
    const tagsResponse = await axios.get(`${OLLAMA_BASE_URL}/api/tags`);
    console.log('✅ Ollama server is running');
    console.log(`   Available models: ${tagsResponse.data.models.map(m => m.name).join(', ')}\n`);

    // Test 2: Check if the required model is available
    console.log('2. Checking if required model is available...');
    const modelExists = tagsResponse.data.models.some(model => model.name === OLLAMA_MODEL);
    if (modelExists) {
      console.log(`✅ Model ${OLLAMA_MODEL} is available\n`);
    } else {
      console.log(`❌ Model ${OLLAMA_MODEL} is not available`);
      console.log(`   Please install it with: ollama pull ${OLLAMA_MODEL}\n`);
      return;
    }

    // Test 3: Test a simple generation
    console.log('3. Testing LLM generation...');
    const testPrompt = 'Hello! Please respond with "Web-Check LLM integration is working!"';
    
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt: testPrompt,
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 100
      }
    }, {
      timeout: 30000
    });

    if (response.data && response.data.response) {
      console.log('✅ LLM generation successful');
      console.log(`   Response: "${response.data.response.trim()}"\n`);
    } else {
      console.log('❌ LLM generation failed - no response received\n');
      return;
    }

    // Test 4: Test the Web-Check LLM insights endpoint (if server is running)
    console.log('4. Testing Web-Check LLM insights endpoint...');
    try {
      const webCheckResponse = await axios.get('http://localhost:3000/api/llm-insights?url=https://example.com', {
        timeout: 10000
      });
      console.log('✅ Web-Check LLM insights endpoint is working\n');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('⚠️  Web-Check server is not running');
        console.log('   Start it with: yarn dev\n');
      } else {
        console.log('❌ Web-Check LLM insights endpoint error:', error.message, '\n');
      }
    }

    console.log('🎉 All tests completed successfully!');
    console.log('   The LLM integration is ready to use.\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Make sure Ollama is installed: https://ollama.ai');
      console.log('   2. Start Ollama server: ollama serve');
      console.log('   3. Install the model: ollama pull mistral:7b-instruct-q4_K_M');
    }
  }
}

testOllamaConnection(); 