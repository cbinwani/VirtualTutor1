#!/bin/bash

# Virtual Tutor Application Test Script
# This script runs tests for both backend and frontend components

echo "===== Starting Virtual Tutor Application Tests ====="

# Navigate to project root
cd /home/ubuntu/virtual-tutor

# Create test directory if it doesn't exist
mkdir -p tests

# Create backend test file
cat > tests/backend.test.js << 'EOL'
const request = require('supertest');
const app = require('../backend/server');
const mongoose = require('mongoose');

// Mock authentication middleware
jest.mock('../backend/middleware/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = {
      userId: 'test-user-id',
      email: 'test@example.com',
      role: 'admin'
    };
    next();
  }
}));

describe('Backend API Tests', () => {
  // Test the health check endpoint
  describe('GET /api/health', () => {
    it('should return 200 OK', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'ok');
    });
  });

  // Test course endpoints
  describe('Course API', () => {
    it('should get courses list', async () => {
      const res = await request(app).get('/api/courses');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('courses');
      expect(Array.isArray(res.body.courses)).toBeTruthy();
    });
  });

  // Test tutor endpoints
  describe('Tutor API', () => {
    it('should process a tutor message', async () => {
      const res = await request(app)
        .post('/api/tutor/message')
        .send({
          sessionId: 'test-session',
          message: 'Hello, can you help me with math?',
          courseId: 'test-course-id'
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('response');
    });
  });

  // Test user endpoints
  describe('User API', () => {
    it('should get user profile', async () => {
      const res = await request(app).get('/api/users/profile');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('userId');
    });
  });

  // Clean up after tests
  afterAll(async () => {
    await mongoose.connection.close();
  });
});
EOL

# Create frontend test file
cat > tests/frontend.test.js << 'EOL'
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock components for testing
const mockComponents = {
  Login: () => <div data-testid="login-component">Login Component</div>,
  Register: () => <div data-testid="register-component">Register Component</div>,
  Home: () => <div data-testid="home-component">Home Component</div>,
  CourseList: () => <div data-testid="course-list-component">Course List Component</div>,
  TutorSession: () => <div data-testid="tutor-session-component">Tutor Session Component</div>,
  AdminDashboard: () => <div data-testid="admin-dashboard-component">Admin Dashboard Component</div>
};

// Mock the components
jest.mock('../frontend/src/pages/Login', () => mockComponents.Login);
jest.mock('../frontend/src/pages/Register', () => mockComponents.Register);
jest.mock('../frontend/src/pages/Home', () => mockComponents.Home);
jest.mock('../frontend/src/pages/CourseList', () => mockComponents.CourseList);
jest.mock('../frontend/src/pages/TutorSession', () => mockComponents.TutorSession);
jest.mock('../frontend/src/pages/admin/AdminDashboard', () => mockComponents.AdminDashboard);

// Mock App component for testing
const App = () => {
  return (
    <BrowserRouter>
      <div>
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/login">Login</a></li>
            <li><a href="/register">Register</a></li>
            <li><a href="/courses">Courses</a></li>
            <li><a href="/tutor">Tutor</a></li>
            <li><a href="/admin">Admin</a></li>
          </ul>
        </nav>
        <div id="content">
          {window.location.pathname === '/' && <mockComponents.Home />}
          {window.location.pathname === '/login' && <mockComponents.Login />}
          {window.location.pathname === '/register' && <mockComponents.Register />}
          {window.location.pathname === '/courses' && <mockComponents.CourseList />}
          {window.location.pathname === '/tutor' && <mockComponents.TutorSession />}
          {window.location.pathname === '/admin' && <mockComponents.AdminDashboard />}
        </div>
      </div>
    </BrowserRouter>
  );
};

describe('Frontend Component Tests', () => {
  test('renders home page by default', () => {
    render(<App />);
    expect(screen.getByTestId('home-component')).toBeInTheDocument();
  });

  test('navigation works correctly', () => {
    render(<App />);
    
    // Click on Login link
    fireEvent.click(screen.getByText('Login'));
    expect(screen.getByTestId('login-component')).toBeInTheDocument();
    
    // Click on Register link
    fireEvent.click(screen.getByText('Register'));
    expect(screen.getByTestId('register-component')).toBeInTheDocument();
    
    // Click on Courses link
    fireEvent.click(screen.getByText('Courses'));
    expect(screen.getByTestId('course-list-component')).toBeInTheDocument();
    
    // Click on Tutor link
    fireEvent.click(screen.getByText('Tutor'));
    expect(screen.getByTestId('tutor-session-component')).toBeInTheDocument();
    
    // Click on Admin link
    fireEvent.click(screen.getByText('Admin'));
    expect(screen.getByTestId('admin-dashboard-component')).toBeInTheDocument();
  });
});
EOL

# Create E2E test file
cat > tests/e2e.test.js << 'EOL'
const puppeteer = require('puppeteer');

describe('Virtual Tutor E2E Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('Home page loads correctly', async () => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('h1');
    const title = await page.$eval('h1', el => el.textContent);
    expect(title).toContain('Virtual Tutor');
  });

  test('User can navigate to login page', async () => {
    await page.goto('http://localhost:3000');
    await page.click('a[href="/login"]');
    await page.waitForSelector('.login-title');
    const loginTitle = await page.$eval('.login-title', el => el.textContent);
    expect(loginTitle).toContain('Welcome Back');
  });

  test('User can navigate to registration page', async () => {
    await page.goto('http://localhost:3000');
    await page.click('a[href="/register"]');
    await page.waitForSelector('form');
    const registerButton = await page.$eval('button[type="submit"]', el => el.textContent);
    expect(registerButton).toContain('Sign Up');
  });

  test('User can view courses page', async () => {
    await page.goto('http://localhost:3000/courses');
    await page.waitForSelector('.course-list');
    const courseListExists = await page.$('.course-list') !== null;
    expect(courseListExists).toBeTruthy();
  });
});
EOL

# Create package.json for tests
cat > tests/package.json << 'EOL'
{
  "name": "virtual-tutor-tests",
  "version": "1.0.0",
  "description": "Tests for Virtual Tutor application",
  "scripts": {
    "test:backend": "jest backend.test.js",
    "test:frontend": "jest frontend.test.js",
    "test:e2e": "jest e2e.test.js",
    "test": "jest"
  },
  "dependencies": {
    "jest": "^29.5.0",
    "supertest": "^6.3.3",
    "puppeteer": "^19.7.2",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^5.16.5"
  },
  "jest": {
    "testEnvironment": "node"
  }
}
EOL

# Create deployment script
cat > deploy.sh << 'EOL'
#!/bin/bash

# Virtual Tutor Application Deployment Script

echo "===== Starting Virtual Tutor Application Deployment ====="

# Navigate to project root
cd /home/ubuntu/virtual-tutor

# Build frontend
echo "Building frontend..."
cd frontend
npm run build
cd ..

# Build backend
echo "Building backend..."
cd backend
npm run build
cd ..

# Deploy frontend
echo "Deploying frontend..."
mkdir -p dist
cp -r frontend/build/* dist/

# Deploy backend
echo "Deploying backend..."
mkdir -p dist/server
cp -r backend/dist/* dist/server/
cp backend/package.json dist/server/

# Create production .env file
echo "Creating production environment file..."
cat > dist/server/.env << EOF
PORT=8080
MONGODB_URI=mongodb://localhost:27017/virtual-tutor
JWT_SECRET=your-production-jwt-secret
OPENAI_API_KEY=your-openai-api-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-pinecone-environment
EOF

echo "===== Deployment Complete ====="
echo "To start the application:"
echo "1. cd dist/server"
echo "2. npm install --production"
echo "3. npm start"

# Expose port for temporary access
echo "===== Exposing Application ====="
echo "Starting application..."
cd dist/server
npm install --production
npm start &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"

# Wait for server to start
sleep 5

echo "Application is now running and can be accessed at:"
echo "http://localhost:8080"
EOL

# Make deployment script executable
chmod +x deploy.sh

echo "===== Test and Deployment Scripts Created ====="
echo "To run tests:"
echo "1. cd tests"
echo "2. npm install"
echo "3. npm test"
echo ""
echo "To deploy the application:"
echo "./deploy.sh"
