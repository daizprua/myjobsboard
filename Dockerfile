# Use official Node.js Alpine image for a smaller footprint, but we need Chromium for Puppeteer
FROM node:20-alpine

# Install Chromium and dependencies for Puppeteer
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont

# Tell Puppeteer to skip installing Chrome. We'll be using the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

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
