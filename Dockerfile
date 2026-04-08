FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy backend source
COPY backend/ ./backend/
COPY .env ./

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3001

CMD ["node", "backend/server-turso.js"]
