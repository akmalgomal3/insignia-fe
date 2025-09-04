# Step 1: Build the application
FROM node:18-alpine AS builder

ENV NEXT_PUBLIC_API_BASE_URL='https://insignia-be-331739783852.asia-southeast2.run.app'
ENV NEXT_PUBLIC_API_TOKEN='very-secret-token'

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Step 2: Production image
FROM node:18-alpine AS runner

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy necessary files from the builder stage
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Change ownership of the files to the nextjs user
RUN chown -R nextjs:nodejs ./

# Switch to the non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Start the application
CMD ["node", "server.js"]