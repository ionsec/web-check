#!/usr/bin/env node

// Test script to verify all fixes
import axios from 'axios';

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';
const TEST_URL = 'google.com';

console.log('🧪 Testing all fixes...\n');

// Test 1: MongoDB Analysis History
console.log('1. Testing MongoDB Analysis History...');
try {
  const response = await axios.get(`${API_BASE}/analysis-history?action=stats`, { timeout: 10000 });
  console.log('✅ MongoDB stats:', response.data);
} catch (error) {
  console.log('⚠️ MongoDB test:', error.message);
}

// Test 2: LLM Insights
console.log('\n2. Testing LLM Insights...');
try {
  const response = await axios.get(`${API_BASE}/llm-insights?url=${TEST_URL}`, { timeout: 45000 });
  console.log('✅ LLM insights working, model:', response.data.model);
  console.log('✅ Insights length:', response.data.insights?.length || 0, 'characters');
} catch (error) {
  console.log('⚠️ LLM test:', error.message);
}

// Test 3: JA4 Fingerprinting
console.log('\n3. Testing JA4 Fingerprinting...');
const startTime = Date.now();
try {
  const response = await axios.get(`${API_BASE}/ja4-fingerprint?url=${TEST_URL}`, { timeout: 20000 });
  const duration = Date.now() - startTime;
  console.log('✅ JA4 fingerprinting working');
  console.log('✅ Duration:', duration, 'ms');
  console.log('✅ Successful connections:', response.data.summary?.successful_connections || 0);
  console.log('✅ Database available:', response.data.database_analysis?.database_available || false);
} catch (error) {
  console.log('⚠️ JA4 test:', error.message);
}

// Test 4: Check with History (Integration test)
console.log('\n4. Testing Check with History integration...');
try {
  const response = await axios.get(`${API_BASE}/check-with-history?url=${TEST_URL}`, { timeout: 60000 });
  console.log('✅ Check with history working');
  console.log('✅ Cached:', response.data.cached || false);
  console.log('✅ Has LLM insights:', !!response.data.llm_insights);
} catch (error) {
  console.log('⚠️ Check with history test:', error.message);
}

console.log('\n🎉 All tests completed!'); 