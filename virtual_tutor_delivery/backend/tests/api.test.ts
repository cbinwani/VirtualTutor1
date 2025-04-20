import axios from 'axios';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Test configuration
const API_URL = 'http://localhost:5000/api';
let authToken = '';
let testUserId = '';
let testCourseId = '';
let testAvatarId = '';

// Test user data
const testUser = {
  email: `test_${Date.now()}@example.com`,
  password: 'Password123!',
  firstName: 'Test',
  lastName: 'User',
  phoneNumber: '1234567890'
};

// Test admin data
const testAdmin = {
  email: `admin_${Date.now()}@example.com`,
  password: 'AdminPass123!',
  firstName: 'Admin',
  lastName: 'User',
  phoneNumber: '0987654321',
  role: 'admin'
};

// Test course data
const testCourse = {
  title: 'Test Course',
  description: 'This is a test course for API testing',
  subject: 'Testing',
  gradeLevel: 'All',
  thumbnail: 'https://example.com/test-thumbnail.jpg',
  duration: '10 hours',
  skillLevels: ['Beginner', 'Intermediate']
};

// Test avatar data
const testAvatar = {
  name: 'Test Avatar',
  modelUrl: 'https://example.com/test-model.glb',
  thumbnailUrl: 'https://example.com/test-avatar.jpg',
  voiceId: 'en-US-Standard-A',
  characteristics: {
    personality: ['Friendly', 'Patient'],
    specialization: ['Mathematics', 'Science'],
    teachingStyle: ['Interactive', 'Visual']
  }
};

describe('Backend API Tests', () => {
  // Setup: Register admin user before tests
  beforeAll(async () => {
    try {
      // Register admin user
      const adminResponse = await axios.post(`${API_URL}/auth/register`, testAdmin);
      expect(adminResponse.status).toBe(201);
      
      // Login as admin
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: testAdmin.email,
        password: testAdmin.password
      });
      
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data.token).toBeDefined();
      
      // Save admin token for tests
      authToken = loginResponse.data.token;
    } catch (error) {
      console.error('Setup failed:', error);
      throw error;
    }
  });
  
  // Authentication Tests
  describe('Authentication API', () => {
    it('should register a new user', async () => {
      const response = await axios.post(`${API_URL}/auth/register`, testUser);
      
      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.user).toBeDefined();
      expect(response.data.token).toBeDefined();
      
      testUserId = response.data.user.id;
    });
    
    it('should not register a user with existing email', async () => {
      try {
        await axios.post(`${API_URL}/auth/register`, testUser);
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.success).toBe(false);
      }
    });
    
    it('should login with correct credentials', async () => {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: testUser.email,
        password: testUser.password
      });
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.token).toBeDefined();
    });
    
    it('should not login with incorrect credentials', async () => {
      try {
        await axios.post(`${API_URL}/auth/login`, {
          email: testUser.email,
          password: 'wrongpassword'
        });
      } catch (error) {
        expect(error.response.status).toBe(401);
        expect(error.response.data.success).toBe(false);
      }
    });
    
    it('should get current user with valid token', async () => {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.user).toBeDefined();
    });
  });
  
  // Course Management Tests
  describe('Course Management API', () => {
    it('should create a new course (admin only)', async () => {
      const response = await axios.post(`${API_URL}/courses`, testCourse, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toBeDefined();
      
      testCourseId = response.data.data._id;
    });
    
    it('should get all courses', async () => {
      const response = await axios.get(`${API_URL}/courses`);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
    
    it('should get a specific course by ID', async () => {
      const response = await axios.get(`${API_URL}/courses/${testCourseId}`);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.course._id).toBe(testCourseId);
    });
    
    it('should update an existing course (admin only)', async () => {
      const updatedCourse = {
        ...testCourse,
        title: 'Updated Test Course'
      };
      
      const response = await axios.put(`${API_URL}/courses/${testCourseId}`, updatedCourse, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.title).toBe('Updated Test Course');
    });
  });
  
  // Avatar Management Tests
  describe('Avatar Management API', () => {
    it('should create a new avatar (admin only)', async () => {
      const response = await axios.post(`${API_URL}/avatars`, testAvatar, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data).toBeDefined();
      
      testAvatarId = response.data.data._id;
    });
    
    it('should get all avatars', async () => {
      const response = await axios.get(`${API_URL}/avatars`);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
    
    it('should get a specific avatar by ID', async () => {
      const response = await axios.get(`${API_URL}/avatars/${testAvatarId}`);
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data._id).toBe(testAvatarId);
    });
    
    it('should update an existing avatar (admin only)', async () => {
      const updatedAvatar = {
        ...testAvatar,
        name: 'Updated Test Avatar'
      };
      
      const response = await axios.put(`${API_URL}/avatars/${testAvatarId}`, updatedAvatar, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.name).toBe('Updated Test Avatar');
    });
  });
  
  // Memory Management Tests
  describe('Memory Management API', () => {
    it('should store a new memory record', async () => {
      const memoryData = {
        key: 'test_memory_key',
        value: 'test memory value',
        type: 'short_term',
        category: 'test',
        importance: 2
      };
      
      const response = await axios.post(`${API_URL}/memory`, memoryData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data.key).toBe('test_memory_key');
    });
    
    it('should retrieve memory records', async () => {
      const response = await axios.get(`${API_URL}/memory`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
    
    it('should retrieve a specific memory record by key', async () => {
      const response = await axios.get(`${API_URL}/memory/key/test_memory_key`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(response.data.data.key).toBe('test_memory_key');
      expect(response.data.data.accessCount).toBeGreaterThan(0);
    });
  });
  
  // Interaction API Tests
  describe('Interaction API', () => {
    let sessionId = `test_session_${Date.now()}`;
    
    it('should create a new interaction', async () => {
      const interactionData = {
        sessionId,
        type: 'question',
        content: 'This is a test question',
        context: {
          courseId: testCourseId
        }
      };
      
      const response = await axios.post(`${API_URL}/interactions`, interactionData, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(201);
      expect(response.data.success).toBe(true);
      expect(response.data.data.sessionId).toBe(sessionId);
    });
    
    it('should retrieve session interactions', async () => {
      const response = await axios.get(`${API_URL}/interactions/session/${sessionId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
      expect(response.data.data.length).toBeGreaterThan(0);
    });
    
    it('should retrieve recent interactions', async () => {
      const response = await axios.get(`${API_URL}/interactions/recent`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
      expect(Array.isArray(response.data.data)).toBe(true);
    });
  });
  
  // Cleanup: Delete test data after tests
  afterAll(async () => {
    try {
      // Delete test course
      if (testCourseId) {
        await axios.delete(`${API_URL}/courses/${testCourseId}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
      }
      
      // Delete test avatar
      if (testAvatarId) {
        await axios.delete(`${API_URL}/avatars/${testAvatarId}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
      }
      
      console.log('Test cleanup completed successfully');
    } catch (error) {
      console.error('Cleanup failed:', error);
    }
  });
});
