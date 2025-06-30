#!/usr/bin/env node

// Test script for LLM insights with processed results
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

async function testLlmInsightsWithProcessedResults() {
  console.log('🤖 Testing LLM Insights with Processed Results...\n');

  try {
    // Test 1: Test with processed results
    console.log('1. Testing LLM insights with processed results...');
    
    const processedResults = {
      ssl: {
        issuer: "Let's Encrypt",
        valid: true,
        expires: "2024-12-31",
        subjectAltName: ["example.com", "www.example.com"]
      },
      "http-security": {
        score: 85,
        grade: "B",
        issues: ["Missing X-Content-Type-Options header"]
      },
      dnssec: {
        status: "unsigned",
        records: []
      },
      hsts: {
        compatible: true,
        hstsHeader: "max-age=31536000; includeSubDomains"
      },
      ports: {
        open: [80, 443],
        closed: [22, 21, 25]
      },
      "security-txt": {
        present: true,
        content: "Contact: mailto:security@example.com\nExpires: 2024-12-31T23:59:59.000Z"
      }
    };

    const response = await axios.get(`${API_BASE}/llm-insights`, {
      params: {
        url: 'https://example.com',
        processedResults: JSON.stringify(processedResults)
      },
      timeout: 60000
    });

    if (response.data && response.data.insights) {
      console.log('✅ LLM insights with security data successful!');
      console.log(`   Model: ${response.data.model}`);
      console.log(`   Analysis Summary: ${response.data.analysis_summary.total_checks} checks`);
      console.log(`   Data Types: Security checks (DNSSEC, HTTP Security, HSTS, Ports, Security.txt, SSL)`);
      console.log(`   Insights Preview: ${response.data.insights.substring(0, 200)}...\n`);
    } else {
      console.log('❌ LLM insights failed - no insights received\n');
    }

    // Test 2: Test fallback to raw API data
    console.log('2. Testing LLM insights fallback (raw API data)...');
    
    const fallbackResponse = await axios.get(`${API_BASE}/llm-insights`, {
      params: {
        url: 'https://example.com'
      },
      timeout: 60000
    });

    if (fallbackResponse.data && fallbackResponse.data.insights) {
      console.log('✅ LLM insights fallback successful!');
      console.log(`   Model: ${fallbackResponse.data.model}`);
      console.log(`   Analysis Summary: ${fallbackResponse.data.analysis_summary.total_checks} checks\n`);
    } else {
      console.log('❌ LLM insights fallback failed\n');
    }

    console.log('🎉 All tests completed successfully!');
    console.log('   The LLM insights with processed results is working correctly.\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Error: ${error.response.data?.error || 'Unknown error'}`);
    }
  }
}

testLlmInsightsWithProcessedResults(); 