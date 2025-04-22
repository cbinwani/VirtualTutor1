#!/bin/bash

# Virtual Tutor Application Deployment Configuration
# This script sets up the deployment configuration for the Virtual Tutor application

echo "===== Creating Deployment Configuration ====="

# Navigate to project root
cd /home/ubuntu/virtual-tutor

# Create Docker configuration
cat > Dockerfile << 'EOL'
FROM node:20-alpine as builder

# Set working directory
WORKDIR /app

# Copy package.json files
COPY package.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/

# Install dependencies
RUN npm install
RUN cd frontend && npm install
RUN cd backend && npm install

# Copy source code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Build backend
RUN cd backend && npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app/backend/dist ./server
COPY --from=builder /app/backend/package.json ./server/
COPY --from=builder /app/frontend/build ./public

# Install production dependencies
WORKDIR /app/server
RUN npm install --production

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "server.js"]
EOL

# Create docker-compose.yml
cat > docker-compose.yml << 'EOL'
version: '3'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/virtual-tutor
      - JWT_SECRET=your-production-jwt-secret
      - OPENAI_API_KEY=your-openai-api-key
      - PINECONE_API_KEY=your-pinecone-api-key
      - PINECONE_ENVIRONMENT=your-pinecone-environment
    depends_on:
      - mongo
    restart: always

  mongo:
    image: mongo:latest
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"
    restart: always

volumes:
  mongo-data:
EOL

# Create .env.example file
cat > .env.example << 'EOL'
# Server Configuration
PORT=8080
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/virtual-tutor

# Authentication
JWT_SECRET=your-jwt-secret
JWT_EXPIRATION=7d

# LLM Configuration
OPENAI_API_KEY=your-openai-api-key
DEFAULT_MODEL=gpt-4

# Vector Database Configuration
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-pinecone-environment
PINECONE_INDEX=virtual-tutor-index

# Avatar Configuration
AVATAR_STORAGE_PATH=./uploads/avatars
MAX_AVATAR_SIZE=5242880 # 5MB

# Course Material Configuration
MATERIAL_STORAGE_PATH=./uploads/materials
MAX_MATERIAL_SIZE=10485760 # 10MB
EOL

# Create README.md
cat > README.md << 'EOL'
# Virtual Tutor Application

A cross-platform application for a Virtual Tutor which provides personalized tutor services to students for any course taught in their school. The application is powered by Large Language Models (LLM) and Retrieval-Augmented Generation (RAG).

## Features

- Digital Human avatar with speech capabilities
- Personalized learning experience based on student preferences
- Short-term and long-term memory to resume from where students left off
- Performance tracking and improvement suggestions
- Administrator interface for course material management

## Technology Stack

- **Frontend**: React.js, Three.js for 3D avatars, Web Speech API
- **Backend**: Node.js, Express.js
- **Database**: MongoDB for data storage, Pinecone for vector embeddings
- **AI**: LangChain, OpenAI API for LLM integration

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- MongoDB
- OpenAI API key
- Pinecone API key

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/virtual-tutor.git
   cd virtual-tutor
   ```

2. Install dependencies
   ```
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

3. Configure environment variables
   ```
   cp .env.example backend/.env
   ```
   Edit the `.env` file with your API keys and configuration.

4. Start the development servers
   ```
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

5. Access the application
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

### Testing

Run the test suite:
```
cd tests
npm install
npm test
```

### Deployment

Deploy using Docker:
```
docker-compose up -d
```

## Usage

### Student Features

1. Register with email and phone number
2. Set preferences for courses and skill level
3. Interact with the Digital Human tutor
4. Track learning progress

### Administrator Features

1. Manage course materials
2. Add and configure Digital Human avatars
3. Monitor student performance
4. Update course content

## License

This project is licensed under the MIT License - see the LICENSE file for details.
EOL

# Create .gitignore
cat > .gitignore << 'EOL'
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage
/tests/node_modules

# Production
/build
/dist
/frontend/build
/backend/dist

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
logs/
*.log

# Editor directories and files
.idea/
.vscode/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Uploads
uploads/
EOL

echo "===== Deployment Configuration Created ====="
echo "To deploy the application using Docker:"
echo "1. Configure your API keys in docker-compose.yml"
echo "2. Run: docker-compose up -d"
echo ""
echo "For local deployment:"
echo "1. Configure your API keys in .env file"
echo "2. Run the test-and-deploy.sh script"
