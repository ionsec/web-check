# Web-Check Docker Setup Guide
## Production-Ready Security Analysis with DeepSeek R1 1.5B

[![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://docker.com)
[![Version](https://img.shields.io/badge/Version-2.1.0-green)](./VERSION.md)
[![Model](https://img.shields.io/badge/Model-DeepSeek%20R1%201.5B-orange)](https://ollama.com/library/deepseek-r1)
[![Storage](https://img.shields.io/badge/Storage-In--Memory-lightblue)](./README.md)

> **Web-Check** security analysis tool with integrated **DeepSeek R1 1.5B** LLM capabilities.  
> Enhanced by **IONSEC Dev Team** - No MongoDB dependency for simplified deployment.

## 🚀 Quick Start

### Prerequisites
- **Docker** 20.10+
- **Docker Compose** 2.0+
- **6GB+ RAM** (8GB+ recommended)
- **8GB+ Storage** (for LLM model)

### One-Command Deployment
```bash
# Clone and start
git clone <repository-url>
cd web-check
docker-compose up -d

# Access Web-Check
open http://localhost:3000
```

## 📋 Table of Contents
- [Quick Start](#-quick-start)
- [Architecture Overview](#-architecture-overview)
- [Installation Options](#-installation-options)
- [Configuration](#-configuration)
- [Security Analysis Features](#-security-analysis-features)
- [Performance Optimization](#-performance-optimization)
- [Troubleshooting](#-troubleshooting)
- [Advanced Usage](#-advanced-usage)
- [Version Migration](#-version-migration)

## 🏗️ Architecture Overview

### Container Stack
```
┌─────────────────────────────────────┐
│           Web-Check v2.1.0          │
│   ┌─────────────┬─────────────────┐  │
│   │  Frontend   │   Backend API   │  │
│   │   (Astro)   │   (Express.js)  │  │
│   └─────────────┴─────────────────┘  │
│   ┌─────────────────────────────────┐  │
│   │      In-Memory Storage         │  │
│   │    (Session-based Cache)       │  │
│   └─────────────────────────────────┘  │
└─────────────────────────────────────┘
              │ HTTP API
┌─────────────────────────────────────┐
│            Ollama LLM               │
│   ┌─────────────────────────────────┐  │
│   │     DeepSeek R1 1.5B Model     │  │
│   │   (Distill-Qwen-1.5B Base)     │  │
│   └─────────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Key Features
- **🚫 No MongoDB** - Simplified architecture with in-memory storage
- **🧠 DeepSeek R1 1.5B** - Optimized LLM for security analysis
- **⚡ 50% Faster Startup** - No database initialization delays
- **🔒 Security Focus** - Specialized risk assessment for 3 critical areas
- **📦 Production Ready** - Optimized for deployment and scaling

## 🛠️ Installation Options

### Option 1: Docker Compose (Recommended)

#### Basic Setup
```bash
# Download docker-compose.yml
curl -o docker-compose.yml https://raw.githubusercontent.com/.../docker-compose.yml

# Start services
docker-compose up -d

# View startup logs
docker-compose logs -f web-check
```

#### Custom Configuration
```yaml
# docker-compose.override.yml
services:
  web-check:
    environment:
      - PORT=8080
      - OLLAMA_CONTEXT_LENGTH=16384
    ports:
      - "8080:8080"

  ollama:
    environment:
      - OLLAMA_MAX_LOADED_MODELS=2
    # Uncomment for GPU support
    # deploy:
    #   resources:
    #     reservations:
    #       devices:
    #         - driver: nvidia
    #           count: all
    #           capabilities: [gpu]
```

### Option 2: Docker Run
```bash
# Create network
docker network create web-check-net

# Start Ollama
docker run -d \
  --name ollama \
  --network web-check-net \
  -p 11434:11434 \
  -v ollama-models:/root/.ollama \
  ollama/ollama:latest

# Start Web-Check
docker run -d \
  --name web-check \
  --network web-check-net \
  -p 3000:3000 \
  -e OLLAMA_BASE_URL=http://ollama:11434 \
  -e OLLAMA_MODEL=deepseek-r1:1.5b \
  web-check:2.1.0-deepseek
```

### Option 3: Build from Source
```bash
# Clone repository
git clone <repository-url>
cd web-check

# Build custom image
docker build -t web-check:custom \
  --build-arg WEBCHECK_VERSION=2.1.0-custom \
  --build-arg OLLAMA_MODEL_VERSION=deepseek-r1:1.5b \
  .

# Start with docker-compose
docker-compose up -d
```

## ⚙️ Configuration

### Environment Variables

#### Web-Check Container
```bash
# Core Configuration
WEBCHECK_VERSION=2.1.0                    # Application version
PORT=3000                                 # Web interface port
STORAGE_TYPE=in-memory                    # Storage backend type

# LLM Configuration
OLLAMA_BASE_URL=http://ollama:11434       # Ollama service URL
OLLAMA_MODEL=deepseek-r1:1.5b             # LLM model to use
OLLAMA_CONTEXT_LENGTH=8192                # Token context length

# API Configuration
API_TIMEOUT_LIMIT=120000                  # API timeout (ms)
API_ENABLE_RATE_LIMIT=true               # Enable rate limiting
API_CORS_ORIGIN=*                        # CORS origin policy

# Browser Configuration
CHROME_PATH=/usr/bin/chromium             # Chrome executable path
```

#### Ollama Container
```bash
# Ollama Configuration
OLLAMA_HOST=0.0.0.0                       # Ollama bind address
OLLAMA_MAX_LOADED_MODELS=1                # Maximum loaded models
OLLAMA_MAX_QUEUE=512                      # Maximum queue size
```

### Volume Configuration
```yaml
volumes:
  # Ollama model storage (persistent)
  ollama_models:
    driver: local
    
  # Web-Check temporary data (optional)
  webcheck_data:
    driver: local
```

### Port Configuration
```yaml
ports:
  web-check:
    - "3000:3000"      # Web interface
  ollama:
    - "11434:11434"    # Ollama API (optional external access)
```

## 🔒 Security Analysis Features

### 1. Open Ports Risk Assessment
```bash
# Analysis includes:
✅ Service identification and fingerprinting
✅ Common vulnerability detection
✅ Attack vector analysis
✅ Port security recommendations
✅ Risk level classification (LOW/MEDIUM/HIGH)
```

### 2. DNS Security (DNSSEC) Analysis
```bash
# Comprehensive evaluation:
✅ DNSSEC validation status
✅ DNS spoofing vulnerability assessment
✅ Authoritative server security
✅ DNS over HTTPS/TLS support
✅ Zone signing and key management
```

### 3. HTTP Security Headers Analysis
```bash
# Security header assessment:
✅ Missing security headers identification
✅ XSS and CSRF protection evaluation
✅ Content Security Policy (CSP) analysis
✅ Strict Transport Security (HSTS) validation
✅ Clickjacking protection assessment
```

### LLM Risk Assessment Output
```json
{
  "security_risk_assessment": "Structured analysis text",
  "model": "deepseek-r1:1.5b",
  "timestamp": "2024-12-XX...",
  "analysis_focus": {
    "open_ports": true,
    "dnssec": true,
    "http_security": true
  },
  "data_availability": {
    "open_ports_available": true,
    "dnssec_available": true,
    "http_security_available": true,
    "total_analyzed_areas": 3
  }
}
```

## ⚡ Performance Optimization

### System Requirements by Deployment Size

#### Small Deployment (< 100 analyses/day)
```yaml
resources:
  web-check:
    memory: 2GB
    cpu: 2 cores
  ollama:
    memory: 4GB
    cpu: 2 cores
```

#### Medium Deployment (< 1000 analyses/day)
```yaml
resources:
  web-check:
    memory: 4GB
    cpu: 4 cores
  ollama:
    memory: 6GB
    cpu: 4 cores
```

#### Large Deployment (1000+ analyses/day)
```yaml
resources:
  web-check:
    memory: 8GB
    cpu: 8 cores
  ollama:
    memory: 12GB
    cpu: 8 cores
    # Consider GPU acceleration
```

### Performance Tuning

#### Memory Optimization
```bash
# Reduce Ollama memory usage
export OLLAMA_MAX_LOADED_MODELS=1
export OLLAMA_NUM_PARALLEL=1

# Optimize Web-Check cache
export CACHE_MAX_SIZE=50        # Reduce cache size
export CACHE_MAX_AGE=3600       # 1 hour cache
```

#### CPU Optimization
```bash
# Enable CPU optimization for DeepSeek model
export OLLAMA_NUM_THREAD=4      # Adjust based on CPU cores
export OLLAMA_NUMA=false        # Disable NUMA for single socket
```

#### Network Optimization
```bash
# Optimize API timeouts
export API_TIMEOUT_LIMIT=60000          # Reduce to 60s
export OLLAMA_REQUEST_TIMEOUT=30000     # LLM timeout 30s
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Ollama Model Download Fails
```bash
# Check Ollama connectivity
curl http://localhost:11434/api/tags

# Manual model download
docker exec ollama ollama pull deepseek-r1:1.5b

# Check model status
docker exec ollama ollama list
```

#### 2. Out of Memory Errors
```bash
# Check memory usage
docker stats

# Reduce model context length
docker-compose down
# Edit docker-compose.yml: OLLAMA_CONTEXT_LENGTH=4096
docker-compose up -d
```

#### 3. Slow LLM Response
```bash
# Check Ollama logs
docker logs ollama

# Restart Ollama with optimizations
docker-compose restart ollama

# Monitor resource usage
docker exec ollama top
```

#### 4. Web-Check Connection Issues
```bash
# Check service status
docker-compose ps

# View Web-Check logs
docker logs web-check

# Test internal connectivity
docker exec web-check curl http://ollama:11434/api/tags
```

### Debug Mode
```bash
# Enable debug logging
docker-compose down
docker-compose up -d --environment DEBUG=true

# View detailed logs
docker-compose logs -f --tail=100
```

### Health Checks
```bash
# Check all services
curl http://localhost:3000/api/status

# Check Ollama health
curl http://localhost:11434/api/tags

# Test LLM functionality
curl http://localhost:3000/api/llm-insights/test
```

## 🚀 Advanced Usage

### Custom Model Integration
```bash
# Pull alternative model
docker exec ollama ollama pull codellama:7b

# Update configuration
# Edit docker-compose.yml:
# OLLAMA_MODEL=codellama:7b

# Restart services
docker-compose restart web-check
```

### Multi-Instance Deployment
```yaml
# docker-compose.scale.yml
services:
  web-check:
    deploy:
      replicas: 3
    environment:
      - INSTANCE_ID=${HOSTNAME}
      
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
```

### GPU Acceleration (NVIDIA)
```yaml
# docker-compose.gpu.yml
services:
  ollama:
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    environment:
      - CUDA_VISIBLE_DEVICES=0
```

### Persistent Analysis Storage
```bash
# Add external storage for analysis results
volumes:
  analysis_exports:
    driver: local
    driver_opts:
      type: none
      o: bind
      device: /opt/web-check/exports
```

## 🔄 Version Migration

### From v2.0.x to v2.1.0

#### Pre-Migration Checklist
- [ ] **Backup Analysis Data:** Export important analysis results
- [ ] **Check System Resources:** Ensure 6GB+ RAM available
- [ ] **Review Configuration:** Note any custom environment variables
- [ ] **Plan Downtime:** Schedule maintenance window

#### Migration Steps
```bash
# 1. Export existing data (if needed)
docker exec web-check curl "http://localhost:3000/api/analysis-history?action=recent&limit=100" > backup.json

# 2. Stop existing deployment
docker-compose down

# 3. Remove old images
docker image rm web-check:2.0.1-ollama

# 4. Update docker-compose.yml
curl -o docker-compose.yml https://raw.githubusercontent.com/.../docker-compose.yml

# 5. Start new deployment
docker-compose up -d

# 6. Verify deployment
curl http://localhost:3000/api/status
```

#### Post-Migration Verification
```bash
# Check version
curl http://localhost:3000/api/status | jq '.version'
# Expected: "2.1.0"

# Test LLM functionality
curl http://localhost:3000/api/llm-insights/test
# Expected: {"status": "ok", "message": "DeepSeek R1 1.5B model is working correctly"}

# Verify security analysis
curl "http://localhost:3000/api?url=https://example.com"
```

## 📊 Monitoring & Logging

### Container Monitoring
```bash
# Real-time resource usage
docker stats

# Container health status
docker-compose ps

# Service logs
docker-compose logs -f
```

### Application Monitoring
```bash
# API health endpoint
curl http://localhost:3000/api/status

# LLM model status
curl http://localhost:11434/api/tags

# Analysis statistics
curl http://localhost:3000/api/analysis-history?action=stats
```

### Log Analysis
```bash
# Web-Check application logs
docker logs web-check 2>&1 | grep ERROR

# Ollama model logs
docker logs ollama 2>&1 | grep "loading model"

# Performance metrics
docker logs web-check 2>&1 | grep "processing time"
```

## 🆘 Support & Resources

### Getting Help
- **GitHub Issues:** [Repository Issues](https://github.com/.../issues)
- **Documentation:** [Full Documentation](./README.md)
- **Version History:** [VERSION.md](./VERSION.md)

### Development Resources
- **API Documentation:** http://localhost:3000/web-check-api/spec
- **Model Information:** [DeepSeek R1 1.5B](https://ollama.com/library/deepseek-r1)
- **Docker Best Practices:** [Docker Documentation](https://docs.docker.com/)

### Community
- **Discussions:** [GitHub Discussions](https://github.com/.../discussions)
- **Security Reports:** security@ionsec.io

---

## 📄 License & Attribution

**Enhanced by:** IONSEC Dev Team <dev@ionsec.io>  
**Original Author:** Alicia Sykes <alicia@omg.lol>  
**License:** MIT  
**Model:** DeepSeek R1 1.5B (Distill-Qwen-1.5B)

---

**🚀 Ready to deploy? Start with:** `docker-compose up -d` 