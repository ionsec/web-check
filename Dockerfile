# Specify the Node.js version to use
ARG NODE_VERSION=21

# Specify the Debian version to use, the default is "bullseye"
ARG DEBIAN_VERSION=bullseye

# Specify the Web-Check version and build info
ARG WEBCHECK_VERSION=2.1.0
ARG OLLAMA_MODEL_VERSION=deepseek-r1:1.5b
ARG BUILD_DATE
ARG VCS_REF

# Use Node.js Docker image as the base image, with specific Node and Debian versions
FROM node:${NODE_VERSION}-${DEBIAN_VERSION} AS build

# Set the container's default shell to Bash and enable some options
SHELL ["/bin/bash", "-euo", "pipefail", "-c"]

# Install Chromium browser, Download and verify Google Chrome's signing key
RUN apt-get update -qq --fix-missing && \
    apt-get -qqy install --allow-unauthenticated gnupg wget curl && \
    wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
    echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list && \
    apt-get update -qq && \
    apt-get -qqy --no-install-recommends install chromium traceroute python make g++ && \
    rm -rf /var/lib/apt/lists/* 

# Run the Chromium browser's version command and redirect its output to the /etc/chromium-version file
RUN /usr/bin/chromium --no-sandbox --version > /etc/chromium-version

# Set the working directory to /app
WORKDIR /app

# Copy package.json and yarn.lock to the working directory
COPY package.json yarn.lock ./

# Run yarn install to install dependencies and clear yarn cache
RUN apt-get update && \
    (yarn install --frozen-lockfile --network-timeout 100000 || yarn install --network-timeout 100000) && \
    rm -rf /app/node_modules/.cache

# Copy all files to working directory
COPY . .

# Run yarn build to build the application
RUN yarn build --production

# Final stage
FROM node:${NODE_VERSION}-${DEBIAN_VERSION}  AS final

# Add metadata labels
LABEL maintainer="IONSEC Dev Team <dev@ionsec.io>"
LABEL org.opencontainers.image.title="Web-Check with DeepSeek R1 Integration"
LABEL org.opencontainers.image.description="Web-Check security analysis tool with integrated DeepSeek R1 1.5B LLM capabilities - Enhanced by IONSEC Dev Team - No MongoDB dependency"
LABEL org.opencontainers.image.version="${WEBCHECK_VERSION}"
LABEL org.opencontainers.image.vendor="IONSEC"
LABEL org.opencontainers.image.source="https://github.com/lissy93/web-check"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.created="${BUILD_DATE}"
LABEL org.opencontainers.image.revision="${VCS_REF}"
LABEL com.webcheck.ollama.model="${OLLAMA_MODEL_VERSION}"
LABEL com.webcheck.ollama.context_length="8192"
LABEL com.webcheck.storage_type="in-memory"
LABEL com.webcheck.enhanced_by="IONSEC Dev Team"
LABEL com.webcheck.original_author="Alicia Sykes <alicia@omg.lol>"

WORKDIR /app

COPY package.json yarn.lock ./
COPY --from=build /app .

# Install Chromium and traceroute in the final stage
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y --no-install-recommends chromium traceroute curl && \
    chmod 755 /usr/bin/chromium && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /app/node_modules/.cache

# Copy and set up the startup script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Exposed container port, the default is 3000, which can be modified through the environment variable PORT
EXPOSE ${PORT:-3000}

# Set the environment variable CHROME_PATH to specify the path to the Chromium binaries
ENV CHROME_PATH='/usr/bin/chromium'

# Set Ollama environment variables (now pointing to external container)
ENV OLLAMA_BASE_URL='http://ollama:11434'
ENV OLLAMA_MODEL='deepseek-r1:1.5b'
ENV OLLAMA_CONTEXT_LENGTH='8192'

# Set storage type
ENV STORAGE_TYPE='in-memory'

# Set version information
ENV WEBCHECK_VERSION="${WEBCHECK_VERSION}"
ENV OLLAMA_MODEL_VERSION="${OLLAMA_MODEL_VERSION}"

# Define the command executed when the container starts
CMD ["/app/start.sh"]
