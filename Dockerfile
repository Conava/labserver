# Use an official Node runtime as a parent image
FROM node:20-bullseye-slim

# Install build dependencies and cron
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    cron \
    && rm -rf /var/lib/apt/lists/*

# Navigate to the project root
WORKDIR /usr/src/app

# Copy the README.md from the project root
COPY README.md .

# Create a directory for the client application
WORKDIR /usr/src/app/client

# Copy the client's package.json and package-lock.json
COPY client/package*.json ./

# Install client dependencies
RUN npm install

# Build the Vue application with retry logic
COPY client/ .
RUN npm run build || npm run build || npm run build

# Navigate to the server directory
WORKDIR /usr/src/app/server

# Copy the server's package.json and package-lock.json
COPY server/package*.json ./

# Install server dependencies
RUN npm install

# Copy the server source code
COPY server/ .

# Generate SSL certificates if they don't exist
RUN mkdir -p certificates && \
    if [ ! -f certificates/key.pem ] || [ ! -f certificates/cert.pem ]; then \
        openssl genrsa -out certificates/key.pem 2048 && \
        openssl req -new -x509 -key certificates/key.pem -out certificates/cert.pem -days 365 -subj "/C=DE/ST=Hamburg/L=Hamburg/O=Laboratory/CN=192.168.4.1"; \
    fi

RUN if [ ! -f .env ]; then \
        openssl rand -hex 32 | awk '{print "SESSION_SECRET="$1}' > .env; \
    fi

# Copy the update script
COPY update_and_run_docker.sh /usr/src/app/update_and_run_docker.sh
RUN chmod +x /usr/src/app/update_and_run_docker.sh

# Set up a cron job to run the script every hour
RUN echo "0 * * * * /usr/src/app/update_and_run_docker.sh" > /etc/cron.d/update_and_run_docker

# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/update_and_run_docker

# Apply cron job
RUN crontab /etc/cron.d/update_and_run_docker

# Expose the port the server listens on
EXPOSE 3000

# Command to run the server
CMD ["sh", "-c", "cron && node server.js -e ${NODE_ENV:-prod} -p 3000"]