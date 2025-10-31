# Use the official Bun image as the base
FROM oven/bun:1.2-alpine AS base

# Set working directory
WORKDIR /app

# Yoink the package files first
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile --production

# Copy source code
COPY . .

# Create a non-root user
RUN addgroup -g 1001 -S larry && \
    adduser -S larry -u 1001 -G larry

# Change ownership of the app directory
RUN chown -R larry:larry /app

# Switch to non-root user
USER larry

# Start the bot
CMD ["bun", "run", "main.ts"]