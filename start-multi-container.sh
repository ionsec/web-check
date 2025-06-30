#!/bin/bash

# Web-Check Multi-Container Startup Script
# Enhanced by IONSEC Dev Team

set -e

echo "🚀 Starting Web-Check with Ollama and MongoDB..."
echo "   Original by: Alicia Sykes <alicia@omg.lol>"
echo "   Enhanced by: IONSEC Dev Team <dev@ionsec.io>"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ docker-compose is not installed. Please install Docker Compose and try again."
    exit 1
fi

# Build images if they don't exist
echo "🔨 Building Docker images..."
docker-compose build

# Start the containers
echo "📦 Starting containers..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."

# Wait for MongoDB
echo "   Waiting for MongoDB..."
max_attempts=60
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if docker-compose exec -T mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        echo "✅ MongoDB is ready!"
        break
    fi
    attempt=$((attempt + 1))
    echo "   Attempt $attempt/$max_attempts..."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ MongoDB failed to start within expected time"
    docker-compose logs mongodb
    exit 1
fi

# Wait for Ollama
echo "   Waiting for Ollama..."
max_attempts=60
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "✅ Ollama is ready!"
        break
    fi
    attempt=$((attempt + 1))
    echo "   Attempt $attempt/$max_attempts..."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Ollama failed to start within expected time"
    docker-compose logs ollama
    exit 1
fi

# Wait for Web-Check
echo "   Waiting for Web-Check..."
max_attempts=60
attempt=0
while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Web-Check is ready!"
        break
    fi
    attempt=$((attempt + 1))
    echo "   Attempt $attempt/$max_attempts..."
    sleep 2
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Web-Check failed to start within expected time"
    docker-compose logs web-check
    exit 1
fi

# Check if model is available
echo "📦 Checking for Mistral model..."
if ! curl -s http://localhost:11434/api/tags | grep -q "mistral:7b-instruct-q4_K_M"; then
    echo "⬇️  Downloading Mistral model (this may take a while)..."
    curl -X POST http://localhost:11434/api/pull -d '{"name": "mistral:7b-instruct-q4_K_M"}'
    echo "✅ Mistral model downloaded successfully"
else
    echo "✅ Mistral model already available"
fi

echo ""
echo "🎉 Web-Check is now running!"
echo ""
echo "📱 Access points:"
echo "   - Web interface: http://localhost:3000"
echo "   - Ollama API: http://localhost:11434"
echo "   - MongoDB: localhost:27017"
echo ""
echo "🔧 Useful commands:"
echo "   - View logs: docker-compose logs -f"
echo "   - Stop services: docker-compose down"
echo "   - Restart services: docker-compose restart"
echo "   - View container status: docker-compose ps"
echo ""
echo "📊 Features:"
echo "   - Security analysis with AI insights"
echo "   - Analysis history and caching"
echo "   - Search through previous analyses"
echo "   - MongoDB data persistence"
echo ""
echo "🚀 Happy analyzing!" 