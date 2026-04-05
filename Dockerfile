FROM node:20.15.1-alpine

RUN mkdir -p /var/www/iaprove-api
WORKDIR /var/www/iaprove-api

# Install pnpm globally
RUN npm install -g pnpm

EXPOSE 4001

ENV NODE_ENV=production

# Copy package files first
COPY package.json pnpm-lock.yaml ./

# Install dependencies (this will compile native modules for the container architecture)
RUN pnpm install

# Copy source code (node_modules is excluded via .dockerignore)
COPY . .

# Build the application
RUN pnpm run build

# Start the application
CMD ["pnpm", "run", "start:prod"]