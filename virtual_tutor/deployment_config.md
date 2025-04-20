# Deployment Configuration for Virtual Tutor Application

This document outlines the deployment configuration for the Virtual Tutor application, including both backend and frontend components.

## Backend Deployment

### Prerequisites
- Node.js 16+ environment
- MongoDB database
- Environment variables configuration

### Environment Variables
Create a `.env` file in the backend directory with the following variables:

```
# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Connection
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/virtualTutor

# JWT Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.com

# Socket.io Configuration
SOCKET_CORS_ORIGIN=https://your-frontend-domain.com

# Optional: Cloud Storage (if using cloud storage for assets)
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_cloud_api_key
CLOUD_API_SECRET=your_cloud_api_secret
```

### Build Process
1. Navigate to the backend directory
2. Install production dependencies: `npm install --production`
3. Build TypeScript files: `npm run build`
4. Start the server: `npm start`

### Docker Deployment (Optional)
A Dockerfile is provided for containerized deployment:

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY dist/ ./dist/
COPY .env ./

EXPOSE 5000

CMD ["node", "dist/index.js"]
```

Build and run the Docker container:
```
docker build -t virtual-tutor-backend .
docker run -p 5000:5000 virtual-tutor-backend
```

## Frontend Deployment

### Prerequisites
- Node.js 16+ environment
- Environment variables configuration

### Environment Variables
Create a `.env` file in the frontend directory with the following variables:

```
# API Configuration
REACT_APP_API_URL=https://your-backend-domain.com
REACT_APP_SOCKET_URL=https://your-backend-domain.com

# Optional: Analytics (if using analytics services)
REACT_APP_ANALYTICS_ID=your_analytics_id
```

### Build Process
1. Navigate to the frontend directory
2. Install dependencies: `npm install`
3. Build the application: `npm run build`
4. The build artifacts will be stored in the `build/` directory

### Static Deployment
The frontend build can be deployed to any static hosting service:

1. Copy the contents of the `build/` directory to your web server
2. Configure the web server to serve the `index.html` file for all routes
3. Ensure proper CORS configuration for API requests

### Docker Deployment (Optional)
A Dockerfile is provided for containerized deployment:

```dockerfile
FROM node:16-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . ./
RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Create an `nginx.conf` file:
```
server {
    listen 80;
    
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000";
    }
}
```

Build and run the Docker container:
```
docker build -t virtual-tutor-frontend .
docker run -p 80:80 virtual-tutor-frontend
```

## Full-Stack Deployment with Docker Compose

For deploying both frontend and backend together, use Docker Compose:

Create a `docker-compose.yml` file:
```yaml
version: '3'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/virtualTutor
      - JWT_SECRET=your_jwt_secret_key
      - JWT_EXPIRE=30d
      - CORS_ORIGIN=http://localhost:80
      - SOCKET_CORS_ORIGIN=http://localhost:80
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://localhost:5000
      - REACT_APP_SOCKET_URL=http://localhost:5000
    restart: always
```

Run the full stack:
```
docker-compose up -d
```

## Cloud Deployment Options

### AWS Deployment
1. Backend: Deploy to AWS Elastic Beanstalk or ECS
2. Frontend: Deploy to S3 with CloudFront distribution
3. Database: Use MongoDB Atlas or AWS DocumentDB

### Google Cloud Platform
1. Backend: Deploy to Google App Engine or Cloud Run
2. Frontend: Deploy to Firebase Hosting
3. Database: Use MongoDB Atlas or Cloud Firestore

### Microsoft Azure
1. Backend: Deploy to Azure App Service
2. Frontend: Deploy to Azure Static Web Apps
3. Database: Use MongoDB Atlas or Azure Cosmos DB

## SSL Configuration

For production deployment, configure SSL certificates:
1. Obtain SSL certificates from Let's Encrypt or a commercial provider
2. Configure your web server or load balancer to use HTTPS
3. Update environment variables to use HTTPS URLs

## Monitoring and Logging

Implement monitoring and logging for production:
1. Use application monitoring services like New Relic or Datadog
2. Configure logging with services like Loggly or ELK Stack
3. Set up alerts for critical errors and performance issues

## Scaling Considerations

For high-traffic deployments:
1. Implement load balancing for the backend services
2. Use a CDN for frontend assets
3. Configure database scaling and replication
4. Implement caching strategies for frequently accessed data
