# Virtual Tutor Application

A cross-platform application providing personalized tutor services with digital human avatars, speech capabilities, and adaptive learning.

## Overview

The Virtual Tutor application is designed to provide personalized tutoring services to students for any course taught in their school. It features a digital human avatar with speech capabilities, student registration and preference management, short-term and long-term memory for personalized learning, and an admin panel for course material management.

## Repository Structure

```
virtual_tutor/
├── backend/               # Backend Express.js application
│   ├── src/               # Source code
│   │   ├── controllers/   # Request handlers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   └── index.ts       # Entry point
│   ├── tests/             # Backend tests
│   ├── Dockerfile         # Docker configuration for backend
│   └── package.json       # Dependencies and scripts
├── frontend/              # Frontend React application
│   ├── src/               # Source code
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React Context providers
│   │   ├── pages/         # Page components
│   │   └── main.tsx       # Entry point
│   ├── tests/             # Frontend tests
│   ├── Dockerfile         # Docker configuration for frontend
│   └── package.json       # Dependencies and scripts
├── tests/                 # Integration tests
├── docker-compose.yml     # Docker Compose configuration
├── deployment_config.md   # Deployment configuration documentation
├── deployment_guide.md    # Deployment guide
├── user_guide.md          # User guide
├── admin_guide.md         # Administrator guide
├── technical_documentation.md  # Technical documentation
├── virtual_tutor_specifications.md  # Application specifications
└── test_plan.md           # Test plan
```

## Key Features

- **Digital Human Avatars**: Lifelike 3D avatars with speech capabilities
- **User Registration**: Students register with email and phone number
- **Course Preferences**: Students provide preferences and skill levels
- **Memory System**: Short-term and long-term memory for personalized tutoring
- **Performance Tracking**: Identifies areas of improvement based on student performance
- **Admin Panel**: Allows administrators to update course materials at any time
- **Cross-Platform**: Works on desktop and mobile devices

## Documentation

- **User Guide**: Instructions for students using the application
- **Admin Guide**: Instructions for administrators managing courses and avatars
- **Technical Documentation**: Architecture, code structure, and implementation details
- **Deployment Guide**: Instructions for deploying the application
- **Deployment Config**: Configuration options for different deployment environments

## Getting Started

### Prerequisites

- Node.js 16+
- MongoDB
- Docker and Docker Compose (for containerized deployment)

### Quick Start with Docker Compose

1. Clone the repository
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

### Manual Development Setup

#### Backend

1. Navigate to the backend directory:
   ```
   cd backend
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
4. Start the development server:
   ```
   npm run dev
   ```

#### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
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
4. Start the development server:
   ```
   npm run dev
   ```

## Testing

Run backend tests:
```
cd backend
npm test
```

Run frontend tests:
```
cd frontend
npm test
```

Run integration tests:
```
npm test
```

## Deployment

See the [Deployment Guide](deployment_guide.md) for detailed instructions on deploying the application to various environments.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
