# Virtual Tutor Deployment Guide

This guide provides step-by-step instructions for deploying the Virtual Tutor application in various environments.

## Prerequisites

Before deploying, ensure you have the following:

- Git installed
- Docker and Docker Compose installed (for containerized deployment)
- Node.js 16+ and npm (for non-containerized deployment)
- MongoDB database (local or cloud-based like MongoDB Atlas)
- Domain name (optional, for production deployment)

## Quick Start with Docker Compose

The easiest way to deploy the entire application stack is using Docker Compose:

1. Clone the repository:
   ```
   git clone https://github.com/your-organization/virtual-tutor.git
   cd virtual-tutor
   ```

2. Configure environment variables:
   ```
   # Backend configuration
   cp backend/.env.example backend/.env
   # Edit backend/.env with your MongoDB connection string and other settings
   
   # Frontend configuration
   cp frontend/.env.example frontend/.env
   # Edit frontend/.env with your API URL settings
   ```

3. Build and start the containers:
   ```
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost
   - Backend API: http://localhost:5000

## Manual Deployment

### Backend Deployment

1. Navigate to the backend directory:
   ```
   cd virtual-tutor/backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   ```
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Build the TypeScript code:
   ```
   npm run build
   ```

5. Start the server:
   ```
   npm start
   ```

### Frontend Deployment

1. Navigate to the frontend directory:
   ```
   cd virtual-tutor/frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   ```
   cp .env.example .env
   # Edit .env with your API URL configuration
   ```

4. Build the application:
   ```
   npm run build
   ```

5. Serve the built files:
   - Using serve: `npx serve -s build`
   - Using nginx: Configure nginx to serve the `build` directory

## Production Deployment

For production deployment, follow these additional steps:

1. Set up SSL certificates for HTTPS
2. Configure a domain name
3. Set up a reverse proxy (like Nginx or Traefik)
4. Implement monitoring and logging
5. Set up database backups

### AWS Deployment Example

1. Backend:
   - Deploy to Elastic Beanstalk using the provided Dockerfile
   - Configure environment variables in the EB Console

2. Frontend:
   - Build the frontend application
   - Upload to an S3 bucket configured for static website hosting
   - Set up CloudFront distribution for CDN and HTTPS

3. Database:
   - Use MongoDB Atlas or set up DocumentDB

## Troubleshooting

### Common Issues

1. **Connection refused to MongoDB**:
   - Check if MongoDB is running
   - Verify connection string in `.env` file
   - Ensure network connectivity to MongoDB server

2. **Frontend can't connect to backend**:
   - Check CORS configuration in backend
   - Verify API URL in frontend `.env` file
   - Check network connectivity between frontend and backend

3. **Docker containers not starting**:
   - Check Docker logs: `docker-compose logs`
   - Verify port availability
   - Ensure Docker has sufficient resources

## Maintenance

### Updates and Upgrades

1. Pull latest changes:
   ```
   git pull origin main
   ```

2. Rebuild containers:
   ```
   docker-compose build
   docker-compose up -d
   ```

### Backups

1. Database backups:
   ```
   # Using mongodump
   mongodump --uri="your_mongodb_uri" --out=backup/$(date +%Y-%m-%d)
   ```

2. Application backups:
   ```
   # Backup environment files
   cp backend/.env backend/.env.backup
   cp frontend/.env frontend/.env.backup
   ```

## Scaling

For high-traffic deployments:

1. Implement load balancing for backend services
2. Use a CDN for frontend assets
3. Configure database scaling and replication
4. Implement caching strategies

## Security Considerations

1. Keep all packages updated
2. Use strong JWT secrets
3. Implement rate limiting
4. Configure proper firewall rules
5. Regularly audit application logs
