import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/contexts/AuthContext';
import Login from '../src/pages/Login';
import Register from '../src/pages/Register';
import Home from '../src/pages/Home';
import Dashboard from '../src/pages/Dashboard';
import TutorSession from '../src/pages/TutorSession';

// Mock axios
jest.mock('axios');
const axios = require('axios');

// Mock components that use Three.js since it's not available in test environment
jest.mock('../src/components/Avatar', () => {
  return function MockAvatar() {
    return <div data-testid="mock-avatar">Avatar Component</div>;
  };
});

// Mock speech components
jest.mock('../src/components/SpeechRecognition', () => {
  return function MockSpeechRecognition({ onResult }) {
    return (
      <button 
        data-testid="mock-speech-recognition"
        onClick={() => onResult('Test speech input')}
      >
        Speech Recognition
      </button>
    );
  };
});

jest.mock('../src/components/SpeechSynthesis', () => {
  return function MockSpeechSynthesis({ text, onStart, onEnd }) {
    return (
      <div data-testid="mock-speech-synthesis">
        <p>{text}</p>
        <button onClick={onStart}>Start Speaking</button>
        <button onClick={onEnd}>Stop Speaking</button>
      </div>
    );
  };
});

// Mock socket.io
jest.mock('socket.io-client', () => {
  const emit = jest.fn();
  const on = jest.fn();
  const disconnect = jest.fn();
  
  return jest.fn(() => ({
    emit,
    on,
    disconnect
  }));
});

describe('Frontend Component Tests', () => {
  // Reset mocks before each test
  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
    axios.put.mockReset();
    axios.delete.mockReset();
  });

  describe('Authentication Components', () => {
    test('Login form should validate inputs and submit', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          success: true,
          token: 'test-token',
          user: { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com', role: 'student' }
        }
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      // Check form elements
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();

      // Fill form
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' }
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /login/i }));

      // Check if API was called with correct data
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          '/api/auth/login',
          { email: 'test@example.com', password: 'password123' }
        );
      });
    });

    test('Register form should validate inputs and submit', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          success: true,
          token: 'test-token',
          user: { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com', role: 'student' }
        }
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <Register />
          </AuthProvider>
        </BrowserRouter>
      );

      // Check form elements
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();

      // Fill form
      fireEvent.change(screen.getByLabelText(/first name/i), {
        target: { value: 'Test' }
      });
      fireEvent.change(screen.getByLabelText(/last name/i), {
        target: { value: 'User' }
      });
      fireEvent.change(screen.getByLabelText(/email/i), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/phone/i), {
        target: { value: '1234567890' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), {
        target: { value: 'password123' }
      });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'password123' }
      });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /register/i }));

      // Check if API was called with correct data
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          '/api/auth/register',
          {
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            phoneNumber: '1234567890',
            password: 'password123'
          }
        );
      });
    });
  });

  describe('Home Component', () => {
    test('Home page should display courses and allow navigation', async () => {
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: [
            { _id: '1', title: 'Math Course', subject: 'Mathematics', description: 'Learn math', thumbnail: 'math.jpg' },
            { _id: '2', title: 'Science Course', subject: 'Science', description: 'Learn science', thumbnail: 'science.jpg' }
          ]
        }
      });

      render(
        <BrowserRouter>
          <AuthProvider>
            <Home />
          </AuthProvider>
        </BrowserRouter>
      );

      // Check if API was called to fetch courses
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/courses');
      });

      // Check if courses are displayed
      await waitFor(() => {
        expect(screen.getByText('Math Course')).toBeInTheDocument();
        expect(screen.getByText('Science Course')).toBeInTheDocument();
      });
    });
  });

  describe('Dashboard Component', () => {
    test('Dashboard should display enrolled courses and progress', async () => {
      // Mock user data
      const mockUser = { id: '1', firstName: 'Test', lastName: 'User', email: 'test@example.com', role: 'student' };
      
      // Mock enrolled courses
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: [
            { 
              _id: '1', 
              course: { _id: '101', title: 'Math Course', subject: 'Mathematics', thumbnail: 'math.jpg' },
              progress: 75,
              lastAccessed: new Date().toISOString()
            }
          ]
        }
      });

      render(
        <BrowserRouter>
          <AuthProvider value={{ user: mockUser, isAuthenticated: true }}>
            <Dashboard />
          </AuthProvider>
        </BrowserRouter>
      );

      // Check if API was called to fetch enrollments
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith('/api/enrollments');
      });

      // Check if enrolled course is displayed
      await waitFor(() => {
        expect(screen.getByText('Math Course')).toBeInTheDocument();
        expect(screen.getByText('75%')).toBeInTheDocument();
      });
    });
  });

  describe('TutorSession Component', () => {
    test('TutorSession should display avatar and chat interface', async () => {
      // Mock course data
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            course: { _id: '101', title: 'Math Course', subject: 'Mathematics' }
          }
        }
      });

      // Mock avatar data
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: [{ _id: '1', name: 'Math Tutor', modelUrl: 'model.glb', thumbnailUrl: 'avatar.jpg', voiceId: 'en-US-1' }]
        }
      });

      // Mock memory data
      axios.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: []
        }
      });

      render(
        <BrowserRouter>
          <AuthProvider value={{ user: { firstName: 'Student' }, isAuthenticated: true }}>
            <TutorSession />
          </AuthProvider>
        </BrowserRouter>
      );

      // Check if avatar component is rendered
      await waitFor(() => {
        expect(screen.getByTestId('mock-avatar')).toBeInTheDocument();
      });

      // Check if chat interface is rendered
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
        expect(screen.getByTestId('mock-speech-recognition')).toBeInTheDocument();
      });

      // Test sending a message
      fireEvent.change(screen.getByPlaceholderText(/type your message/i), {
        target: { value: 'Hello tutor' }
      });
      fireEvent.click(screen.getByRole('button', { name: /send/i }));

      // Test speech recognition
      fireEvent.click(screen.getByTestId('mock-speech-recognition'));
      
      // Check if message appears in chat
      await waitFor(() => {
        expect(screen.getByText('Hello tutor')).toBeInTheDocument();
      });
    });
  });
});
