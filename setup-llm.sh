#!/bin/bash

# Web-Check LLM Setup Script
# Enhanced by IONSEC Dev Team
# Original by: Alicia Sykes <alicia@omg.lol>

set -e

echo "🚀 Web-Check LLM Setup Script"
echo "============================="
echo "Enhanced by: IONSEC Dev Team <dev@ionsec.io>"
echo "Original by: Alicia Sykes <alicia@omg.lol>"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

# Check if Ollama is installed
echo -e "${YELLOW}1. Checking Ollama installation...${NC}"
if command -v ollama > /dev/null 2>&1; then
    print_status 0 "Ollama is installed"
    OLLAMA_VERSION=$(ollama --version)
    echo "   Version: $OLLAMA_VERSION"
else
    print_status 1 "Ollama is not installed"
    echo ""
    echo -e "${BLUE}📥 Installing Ollama...${NC}"
    curl -fsSL https://ollama.ai/install.sh | sh
    echo ""
    echo -e "${GREEN}✅ Ollama installed successfully${NC}"
fi

echo ""

# Start Ollama server if not running
echo -e "${YELLOW}2. Starting Ollama server...${NC}"
if pgrep -x "ollama" > /dev/null; then
    print_status 0 "Ollama server is already running"
else
    echo "   Starting Ollama server..."
    ollama serve &
    OLLAMA_PID=$!
    
    # Wait for Ollama to be ready
    echo "   Waiting for Ollama to be ready..."
    sleep 5
    
    # Test connection
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        print_status 0 "Ollama server started successfully"
    else
        print_status 1 "Failed to start Ollama server"
        exit 1
    fi
fi

echo ""

# Check if mistral:7b-instruct-q4_K_M model is installed
echo -e "${YELLOW}3. Checking for mistral:7b-instruct-q4_K_M model...${NC}"
if ollama list | grep -q "mistral:7b-instruct-q4_K_M"; then
    print_status 0 "mistral:7b-instruct-q4_K_M model is available"
else
    echo -e "${YELLOW}⚠️  mistral:7b-instruct-q4_K_M model is not available${NC}"
    echo "   This model is CPU-optimized for better performance"
    echo ""
    echo -e "${BLUE}📦 Installing mistral:7b-instruct-q4_K_M model...${NC}"
    echo "   This may take several minutes depending on your internet connection..."
    ollama pull mistral:7b-instruct-q4_K_M
    print_status 0 "mistral:7b-instruct-q4_K_M model installed successfully"
fi

echo ""

# Set environment variables
echo -e "${YELLOW}4. Setting up environment variables...${NC}"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "   Creating .env file..."
    cat > .env << EOF
# Web-Check LLM Configuration
# Enhanced by IONSEC Dev Team
# Original by: Alicia Sykes <alicia@omg.lol>

# Ollama Configuration
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral:7b-instruct-q4_K_M
OLLAMA_CONTEXT_LENGTH=8192

# Web-Check Configuration
PORT=3000
WEBCHECK_VERSION=2.0.1
EOF
    print_status 0 ".env file created"
else
    echo "   .env file already exists"
    print_status 0 "Environment variables configured"
fi

echo ""

# Test the setup
echo -e "${YELLOW}5. Testing LLM integration...${NC}"

# Test Ollama connection
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    print_status 0 "Ollama API is accessible"
else
    print_status 1 "Ollama API is not accessible"
    exit 1
fi

# Test model availability
if ollama list | grep -q "mistral:7b-instruct-q4_K_M"; then
    print_status 0 "Model is available"
else
    print_status 1 "Model is not available"
    exit 1
fi

# Test model generation
echo "   Testing model generation..."
if node test-llm.js > /dev/null 2>&1; then
    print_status 0 "Model generation test passed"
else
    echo -e "${YELLOW}⚠️  Model generation test failed (this is normal if Web-Check is not running)${NC}"
fi

echo ""

# Success message
echo -e "${GREEN}🎉 LLM setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Configuration Summary:${NC}"
echo "   - Ollama Server: http://localhost:11434"
echo "   - Model: mistral:7b-instruct-q4_K_M (CPU optimized)"
echo "   - Context Length: 8192 tokens"
echo "   - Enhanced by: IONSEC Dev Team"
echo "   - Original by: Alicia Sykes <alicia@omg.lol>"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "   1. Start Web-Check:"
echo "      yarn dev"
echo ""
echo "   2. Run a web check on any URL"
echo ""
echo "   3. Click 'Generate AI Insights' to test the LLM integration"
echo ""
echo -e "${BLUE}🔧 Useful Commands:${NC}"
echo "   - Test LLM: node test-llm.js"
echo "   - Check models: ollama list"
echo "   - Remove model: ollama rm mistral:7b-instruct-q4_K_M"
echo "   - Pull different model: ollama pull mistral:7b"
echo ""
echo -e "${BLUE}📝 Environment Variables:${NC}"
echo "   - OLLAMA_BASE_URL=http://localhost:11434"
echo "   - OLLAMA_MODEL=mistral:7b-instruct-q4_K_M"
echo "   - OLLAMA_CONTEXT_LENGTH=8192"
echo ""
echo -e "${GREEN}✨ Setup complete! The LLM integration is ready to use.${NC}" 