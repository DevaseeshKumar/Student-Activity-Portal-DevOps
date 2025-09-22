# Use official Node 20 image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./

# Install dependencies (use npm ci for reproducible builds)
RUN npm ci

# Copy source code
COPY . .

# Create .vite folder to avoid ENOENT errors
RUN mkdir -p /app/.vite

# Expose Vite dev server port
EXPOSE 5173

# Use CHOKIDAR_USEPOLLING for Docker filesystem watching
ENV CHOKIDAR_USEPOLLING=true

# Start Vite dev server
CMD ["npm", "run", "dev", "--", "--host"]
