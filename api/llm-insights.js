import axios from 'axios';
import middleware from './_common/middleware.js';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'deepseek-r1:1.5b';

const testModelConnection = async () => {
  try {
    // Test with a simple prompt
    const testPrompt = 'Please respond with "OK" if you can read this message.';
    
    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, {
      model: OLLAMA_MODEL,
      prompt: testPrompt,
      stream: false,
      options: {
        temperature: 0.1,
        num_predict: 10
      }
    }, {
      timeout: 10000, // 10 second timeout for test
      headers: {
        'Content-Type': 'application/json'
      }
    });

    return response.data && response.data.response;
  } catch (error) {
    throw new Error(`Model test failed: ${error.message}`);
  }
};

const generateSecurityRiskAssessment = async (url, securityData) => {
  try {
    // Extract the three focus areas
    const httpSecurity = securityData.httpSecurity || securityData['http-security'] || null;
    const dnssec = securityData.dnssec || null;
    const ports = securityData.ports || null;

    // Create focused security risk assessment prompt
    const prompt = `You are a cybersecurity expert. Analyze the security risks for ${url} based on these three critical areas:

**OPEN PORTS ANALYSIS:**
${ports ? JSON.stringify(ports, null, 2) : 'No open ports data available'}

**DNS SECURITY (DNSSEC) ANALYSIS:**
${dnssec ? JSON.stringify(dnssec, null, 2) : 'No DNSSEC data available'}

**HTTP SECURITY HEADERS ANALYSIS:**
${httpSecurity ? JSON.stringify(httpSecurity, null, 2) : 'No HTTP security headers data available'}

Provide a comprehensive security risk assessment focusing ONLY on these three areas. For each area:

1. **Risk Level**: Rate as LOW, MEDIUM, or HIGH
2. **Key Findings**: List the most critical security issues found
3. **Risk Impact**: Explain potential attack vectors and consequences
4. **Recommendations**: Provide specific, actionable security improvements

Format your response as structured sections for each area. Be concise but thorough.`;

    const requestBody = {
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.2,
        top_p: 0.8,
        num_predict: 1000, // Increased for detailed risk assessment
        stop: ['<|endoftext|>']
      }
    };

    const response = await axios.post(`${OLLAMA_BASE_URL}/api/generate`, requestBody, {
      timeout: 45000, // Increased timeout for detailed analysis
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.response) {
      return {
        security_risk_assessment: response.data.response,
        model: OLLAMA_MODEL,
        timestamp: new Date().toISOString(),
        analysis_focus: {
          open_ports: !!ports,
          dnssec: !!dnssec,
          http_security: !!httpSecurity
        },
        data_availability: {
          open_ports_available: !!ports,
          dnssec_available: !!dnssec,
          http_security_available: !!httpSecurity,
          total_analyzed_areas: [ports, dnssec, httpSecurity].filter(Boolean).length
        }
      };
    } else {
      throw new Error('Invalid response from Ollama');
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error(`Cannot connect to Ollama server at ${OLLAMA_BASE_URL}. Please ensure Ollama is running and the model ${OLLAMA_MODEL} is installed.`);
    }
    if (error.response && error.response.status === 404) {
      throw new Error(`Model ${OLLAMA_MODEL} not found. Please install it using: ollama pull ${OLLAMA_MODEL}`);
    }
    throw new Error(`LLM security risk assessment failed: ${error.message}`);
  }
};

const llmInsightsHandler = async (url, req) => {
  try {
    // Get processedResults from query parameters if available
    const processedResults = req?.query?.processedResults;
    
    if (!url) {
      throw new Error('URL parameter is required');
    }

    // If processedResults is provided, use it directly
    if (processedResults) {
      let parsedResults;
      try {
        parsedResults = JSON.parse(processedResults);
      } catch (parseError) {
        throw new Error('Invalid processedResults JSON format');
      }
      
      const riskAssessment = await generateSecurityRiskAssessment(url, parsedResults);
      return riskAssessment;
    }

    // Fallback: fetch raw API data if no processed results provided
    const apiBase = process.env.PUBLIC_API_ENDPOINT || `http://localhost:${process.env.PORT || 3000}/api`;
    
    const allResultsResponse = await axios.get(`${apiBase}?url=${encodeURIComponent(url)}`, {
      timeout: 120000
    });

    if (allResultsResponse.data && allResultsResponse.data.error) {
      throw new Error(`Failed to fetch analysis results: ${allResultsResponse.data.error}`);
    }

    const riskAssessment = await generateSecurityRiskAssessment(url, allResultsResponse.data);
    return riskAssessment;

  } catch (error) {
    throw new Error(`LLM Security Risk Assessment failed: ${error.message}`);
  }
};

const testHandler = async () => {
  try {
    const result = await testModelConnection();
    return { status: 'ok', message: 'DeepSeek R1 1.5B model is working correctly', response: result };
  } catch (error) {
    throw new Error(`Model test failed: ${error.message}`);
  }
};

export const handler = middleware(llmInsightsHandler);
export const test = middleware(testHandler);
export default handler;