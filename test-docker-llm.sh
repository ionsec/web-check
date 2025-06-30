#!/bin/bash

# Test script for Docker container with Ollama integration
set -e

echo "🧪 Testing Web-Check Docker with Ollama Integration"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if Docker is running
echo "1. Checking Docker status..."
if docker info > /dev/null 2>&1; then
    print_status 0 "Docker is running"
else
    print_status 1 "Docker is not running"
    exit 1
fi

# Check if docker-compose is available
echo "2. Checking docker-compose..."
if command -v docker-compose > /dev/null 2>&1; then
    print_status 0 "docker-compose is available"
else
    print_status 1 "docker-compose is not available"
    exit 1
fi

# Check if the container is running
echo "3. Checking if Web-Check container is running..."
if docker ps | grep -q "web-check"; then
    print_status 0 "Web-Check container is running"
else
    echo -e "${YELLOW}⚠️  Web-Check container is not running${NC}"
    echo "   Starting container..."
    docker-compose up -d
    sleep 10
fi

# Wait for the application to be ready
echo "4. Waiting for Web-Check application to be ready..."
max_attempts=30
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_status 0 "Web-Check application is ready"
        break
    fi
    attempt=$((attempt + 1))
    echo "   Attempt $attempt/$max_attempts..."
    sleep 5
done

if [ $attempt -eq $max_attempts ]; then
    print_status 1 "Web-Check application failed to start"
    echo "   Checking container logs..."
    docker-compose logs web-check
    exit 1
fi

# Test Ollama API
echo "5. Testing Ollama API..."
max_attempts=20
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker exec web-check curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        print_status 0 "Ollama API is responding"
        break
    fi
    attempt=$((attempt + 1))
    echo "   Attempt $attempt/$max_attempts..."
    sleep 3
done

if [ $attempt -eq $max_attempts ]; then
    print_status 1 "Ollama API is not responding"
    exit 1
fi

# Check if the model is available
echo "6. Checking if mistral:7b-instruct-q4_K_M model is available..."
if docker exec web-check ollama list | grep -q "mistral:7b-instruct-q4_K_M"; then
    print_status 0 "mistral:7b-instruct-q4_K_M model is available"
else
    echo -e "${YELLOW}⚠️  mistral:7b-instruct-q4_K_M model is not available${NC}"
    echo "   This is normal on first run - the model will be downloaded automatically"
fi

# Test LLM insights endpoint
echo "7. Testing LLM insights endpoint..."
if curl -s "http://localhost:3000/api/llm-insights-test" > /dev/null 2>&1; then
    print_status 0 "LLM insights endpoint is working"
else
    print_status 1 "LLM insights endpoint is not working"
fi

# Test a simple web check
echo "8. Testing web check functionality..."
if curl -s "http://localhost:3000/api/status?url=https://example.com" > /dev/null 2>&1; then
    print_status 0 "Web check API is working"
else
    print_status 1 "Web check API is not working"
fi

echo ""
echo "🎉 All tests completed!"
echo ""
echo "📋 Summary:"
echo "   - Web-Check: http://localhost:3000"
echo "   - Ollama API: http://localhost:11434"
echo "   - Model: mistral:7b-instruct-q4_K_M (CPU optimized)"
echo ""
echo "🚀 Next steps:"
echo "   1. Open http://localhost:3000 in your browser"
echo "   2. Run a web check on any URL"
echo "   3. Click 'Generate AI Insights' to test the LLM integration"
echo ""
echo "📝 Useful commands:"
echo "   - View logs: docker-compose logs -f web-check"
echo "   - Stop container: docker-compose down"
echo "   - Restart container: docker-compose restart"
echo "   - Access container: docker exec -it web-check bash" 