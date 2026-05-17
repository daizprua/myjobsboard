# Use official Node.js slim image for a robust environment with proper OpenSSL support
FROM node:20-slim

# Install Chromium and dependencies for Puppeteer
RUN apt-get update && apt-get install -y \
      chromium \
      fonts-freefont-ttf \
      --no-install-recommends \
      && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Install backend dependencies
RUN npm install --legacy-peer-deps

# Copy frontend package files and install
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install --legacy-peer-deps

# Copy all source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the frontend Vite application
RUN cd frontend && npm run build

# Expose the API and Frontend port
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
