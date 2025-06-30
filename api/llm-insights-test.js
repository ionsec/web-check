import axios from 'axios';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'mistral:7b-instruct-q4_K_M';

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

// Simple handler without middleware for testing
const handler = async (req, res) => {
  try {
    const result = await testModelConnection();
    res.json({ status: 'ok', message: 'Model is working correctly', response: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default handler; 