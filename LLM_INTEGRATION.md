# Web-Check LLM Integration

This document describes the LLM (Large Language Model) integration in Web-Check, enhanced by IONSEC Dev Team.

## Overview

Web-Check now includes AI-powered security insights using Ollama and the Mistral 7B Instruct Q4_K_M model, optimized for CPU performance.

**Original by:** Alicia Sykes <alicia@omg.lol>  
**Enhanced by:** IONSEC Dev Team <dev@ionsec.io>

## Quick Start

### 1. Install Ollama

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

### 2. Install the Required Model

```bash
ollama pull mistral:7b-instruct-q4_K_M
```

### 3. Start Ollama Server

```bash
ollama serve
```

### 4. Set Environment Variables

```bash
export OLLAMA_BASE_URL=http://localhost:11434
export OLLAMA_MODEL=mistral:7b-instruct-q4_K_M
export OLLAMA_CONTEXT_LENGTH=8192
```

### 5. Start Web-Check

```bash
yarn dev
```

## Configuration

### Environment Variables

- `OLLAMA_BASE_URL`: URL of the Ollama server (default: `http://localhost:11434`)
- `OLLAMA_MODEL`: Model to use for analysis (default: `mistral:7b-instruct-q4_K_M`)
- `OLLAMA_CONTEXT_LENGTH`: Maximum context length in tokens (default: `8192`)

### Model Information

- **Model**: `mistral:7b-instruct-q4_K_M` (CPU optimized)
- **Size**: ~4.1 GB (quantized)
- **Context Length**: 8192 tokens
- **Performance**: Optimized for CPU usage
- **Memory**: Lower memory footprint than standard Mistral 7B

## API Endpoints

### LLM Insights

`GET /api/llm-insights?url=<target_url>&processedResults=<json_data>`

Generates AI-powered security insights for a given URL.

**Parameters:**
- `url`: Target URL to analyze
- `processedResults`: (Optional) Pre-processed results from other Web-Check endpoints

**Example:**
```bash
curl "http://localhost:3000/api/llm-insights?url=https://example.com"
```

### LLM Test

`GET /api/llm-insights-test`

Tests the LLM connection and model availability.

**Example:**
```bash
curl "http://localhost:3000/api/llm-insights-test"
```

## Docker Integration

### Using Docker Compose

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f web-check

# Stop
docker-compose down
```

### Manual Docker Build

```bash
# Build with custom version
WEBCHECK_VERSION=2.0.1 OLLAMA_MODEL_VERSION=mistral:7b-instruct-q4_K_M ./build-docker.sh

# Run container
docker run -d \
  --name web-check \
  -p 3000:3000 \
  -e OLLAMA_BASE_URL=http://localhost:11434 \
  -e OLLAMA_MODEL=mistral:7b-instruct-q4_K_M \
  -e OLLAMA_CONTEXT_LENGTH=8192 \
  web-check:2.0.1-ollama
```

## Model Management

### Available Models

- **mistral:7b-instruct-q4_K_M**: CPU-optimized quantized model (recommended)
- **mistral:7b**: Standard Mistral 7B model
- **gemma2:4b**: Google's Gemma 2 4B model

### Switching Models

```bash
# List available models
ollama list

# Pull a different model
ollama pull mistral:7b

# Remove unused model
docker exec web-check ollama rm mistral:7b
```

### Model Performance

| Model | Size | Memory | CPU Performance | Quality |
|-------|------|--------|----------------|---------|
| mistral:7b-instruct-q4_K_M | 4.1GB | Low | Excellent | High |
| mistral:7b | 4.1GB | Medium | Good | High |
| gemma2:4b | 2.5GB | Low | Good | Medium |

## Troubleshooting

### Common Issues

1. **Model not found**
   ```bash
   Error: Model mistral:7b-instruct-q4_K_M not found
   ```
   **Solution**: Install the model
   ```bash
   ollama pull mistral:7b-instruct-q4_K_M
   ```

2. **Connection refused**
   ```bash
   Error: Cannot connect to Ollama server
   ```
   **Solution**: Start Ollama server
   ```bash
   ollama serve
   ```

3. **Timeout errors**
   ```bash
   Error: LLM analysis timed out
   ```
   **Solution**: Increase timeout or use a smaller model

### Testing

Run the test script to verify the setup:

```bash
node test-llm.js
```

Or use the Docker test script:

```bash
./test-docker-llm.sh
```

## API Examples

### Basic Analysis

```javascript
const response = await fetch('/api/llm-insights?url=https://example.com');
const insights = await response.json();
console.log(insights);
```

### With Pre-processed Results

```javascript
const results = {
  ssl: { valid: true, issuer: "Let's Encrypt" },
  headers: { hsts: true, csp: false },
  dnssec: { enabled: true }
};

const response = await fetch(`/api/llm-insights?url=https://example.com&processedResults=${encodeURIComponent(JSON.stringify(results))}`);
const insights = await response.json();
```

### Ollama API Direct

```javascript
const response = await fetch('http://localhost:11434/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: "mistral:7b-instruct-q4_K_M",
    prompt: "Analyze this security data...",
    stream: false,
    options: {
      temperature: 0.7,
      num_predict: 1500
    }
  })
});
```

## Security Considerations

- Ollama server runs locally by default
- No data is sent to external services
- Model files are stored locally
- Container runs with non-root user for security
- Security scanning with Docker Scout integration

## Performance Optimization

### For CPU Usage
- Use `mistral:7b-instruct-q4_K_M` model
- Set appropriate context length
- Monitor memory usage
- Use quantized models for better performance

### For Production
- Use Docker containers
- Implement proper logging
- Set up monitoring
- Regular security updates

## Contributing

This LLM integration was enhanced by IONSEC Dev Team. For contributions:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details. 