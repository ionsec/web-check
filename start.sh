#!/bin/bash

# Web-Check with DeepSeek R1 Integration Startup Script
# Enhanced by IONSEC Dev Team - Version 2.1.0
# No MongoDB dependency - In-memory storage
set -e

echo "🚀 Starting Web-Check with DeepSeek R1 Integration (IONSEC Enhanced v2.1.0)..."
echo "   Original by: Alicia Sykes <alicia@omg.lol>"
echo "   Enhanced by: IONSEC Dev Team <dev@ionsec.io>"
echo "   🔥 NEW: No MongoDB dependency - Lightning fast in-memory storage"
echo "   🧠 NEW: DeepSeek R1 1.5B model for security risk assessment"

# Wait for Ollama to be ready (now in separate container)
echo "⏳ Waiting for Ollama server to be ready..."
max_attempts=60
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://ollama:11434/api/tags > /dev/null 2>&1; then
        echo "✅ Ollama server is ready!"
        break
    fi
    attempt=$((attempt + 1))
    echo "   Attempt $attempt/$max_attempts..."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Ollama server failed to start within expected time"
    exit 1
fi

# Check and pull the DeepSeek R1 1.5B model if needed
echo "📦 Checking for DeepSeek R1 1.5B model..."
if ! curl -s http://ollama:11434/api/tags | grep -q "deepseek-r1:1.5b"; then
    echo "⬇️  Downloading DeepSeek R1 1.5B model (Distill-Qwen-1.5B)..."
    echo "   This model is optimized for CPU performance and focused security analysis"
    curl -X POST http://ollama:11434/api/pull -d '{"name": "deepseek-r1:1.5b"}'
    echo "✅ DeepSeek R1 1.5B model downloaded successfully"
else
    echo "✅ DeepSeek R1 1.5B model already available"
fi

# Set environment variables for LLM integration
export OLLAMA_BASE_URL=http://ollama:11434
export OLLAMA_MODEL=deepseek-r1:1.5b

# Set Ollama context size for better performance with security prompts
export OLLAMA_CONTEXT_LENGTH=8192

# Set storage type
export STORAGE_TYPE=in-memory

echo "🌐 Starting Web-Check application..."
echo "   - Web interface: http://localhost:3000"
echo "   - Ollama API: http://ollama:11434"
echo "   - LLM Model: DeepSeek R1 1.5B (Distill-Qwen-1.5B)"
echo "   - Context Length: 8192 tokens"
echo "   - Storage: In-memory (session-based caching)"
echo "   - Version: 2.1.0"
echo "   - Enhanced by: IONSEC Dev Team"
echo ""
echo "🔍 Security Analysis Focus Areas:"
echo "   - Open Ports Risk Assessment"
echo "   - DNS Security (DNSSEC) Analysis"
echo "   - HTTP Security Headers Evaluation"
echo ""
echo "🚀 No MongoDB required - Faster startup and reduced complexity!"

# Start the web-check application
exec yarn start 