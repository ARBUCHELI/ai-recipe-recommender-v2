# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory in container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript code
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Create uploads directory and set permissions
RUN mkdir -p uploads/avatars && chown -R nodejs:nodejs uploads

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 10000

# Start application
CMD ["npm", "start"]