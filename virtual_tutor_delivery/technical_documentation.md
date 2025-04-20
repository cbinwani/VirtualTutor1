# Virtual Tutor Application - Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Backend Structure](#backend-structure)
4. [Frontend Structure](#frontend-structure)
5. [Database Schema](#database-schema)
6. [API Documentation](#api-documentation)
7. [Authentication System](#authentication-system)
8. [Memory System](#memory-system)
9. [Speech Integration](#speech-integration)
10. [Avatar Integration](#avatar-integration)
11. [Real-time Communication](#real-time-communication)
12. [Performance Considerations](#performance-considerations)
13. [Security Considerations](#security-considerations)

## Architecture Overview

The Virtual Tutor application follows a modern client-server architecture with a RESTful API backend, real-time communication via WebSockets, and a responsive frontend. The application is designed to be scalable, maintainable, and cross-platform.

### High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Client         │     │  Server         │     │  Database       │
│  (React)        │◄────┤  (Express.js)   │◄────┤  (MongoDB)      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                       ▲
        │                       │
        │                       │
        │                       │
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  WebSockets     │     │  External APIs  │
│  (Socket.io)    │     │  (Speech, etc.) │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
```

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Communication**: Socket.io
- **API Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: React
- **Language**: TypeScript
- **State Management**: React Context API
- **Routing**: React Router
- **HTTP Client**: Axios
- **3D Rendering**: Three.js
- **Styling**: CSS with BEM methodology
- **Speech Recognition**: Web Speech API
- **Speech Synthesis**: Web Speech API

### DevOps
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **Web Server**: Nginx
- **Version Control**: Git

## Backend Structure

The backend follows a modular architecture with clear separation of concerns:

```
backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   ├── config/         # Configuration
│   ├── types/          # TypeScript type definitions
│   └── index.ts        # Application entry point
├── dist/               # Compiled JavaScript
├── tests/              # Test files
├── .env.example        # Environment variables template
├── tsconfig.json       # TypeScript configuration
├── package.json        # Dependencies and scripts
└── Dockerfile          # Docker configuration
```

### Key Components

#### Controllers
Controllers handle HTTP requests and responses. They validate input, call appropriate services, and format responses.

Example controller:
```typescript
// authController.ts
import { Request, Response } from 'express';
import User from '../models/User';
import { generateToken } from '../utils/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phoneNumber } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }
    
    // Create new user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phoneNumber
    });
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
```

#### Models
Models define the database schema and provide methods for interacting with the database.

Example model:
```typescript
// User.ts
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: 'student' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  firstName: {
    type: String,
    required: [true, 'Please add a first name']
  },
  lastName: {
    type: String,
    required: [true, 'Please add a last name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please add a phone number']
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    default: 'student'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encrypt password using bcrypt
UserSchema.pre<IUser>('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
```

#### Routes
Routes define the API endpoints and connect them to controllers.

Example routes:
```typescript
// authRoutes.ts
import express from 'express';
import { register, login, getMe } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
```

## Frontend Structure

The frontend follows a component-based architecture with React:

```
frontend/
├── public/             # Static files
├── src/
│   ├── components/     # Reusable UI components
│   ├── contexts/       # React Context providers
│   ├── pages/          # Page components
│   ├── services/       # API service functions
│   ├── utils/          # Utility functions
│   ├── hooks/          # Custom React hooks
│   ├── assets/         # Images, fonts, etc.
│   ├── styles/         # Global styles
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
├── tests/              # Test files
├── .env.example        # Environment variables template
├── tsconfig.json       # TypeScript configuration
├── package.json        # Dependencies and scripts
└── Dockerfile          # Docker configuration
```

### Key Components

#### Context Providers
Context providers manage global state and provide it to components.

Example context:
```typescript
// AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check if user is logged in
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        // Set auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const res = await axios.get('/api/auth/me');
        
        setUser(res.data.user);
        setLoading(false);
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      setUser(res.data.user);
    } catch (error) {
      throw error;
    }
  };
  
  const register = async (userData: any) => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      
      localStorage.setItem('token', res.data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      setUser(res.data.user);
    } catch (error) {
      throw error;
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

#### Avatar Component
The Avatar component renders the 3D digital human using Three.js.

Example component:
```typescript
// Avatar.tsx
import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import './Avatar.css';

interface AvatarProps {
  modelUrl: string;
  speaking: boolean;
  emotion: 'neutral' | 'happy' | 'thinking' | 'confused';
  scale?: number;
  position?: [number, number, number];
}

const Avatar: React.FC<AvatarProps> = ({
  modelUrl,
  speaking,
  emotion,
  scale = 1,
  position = [0, 0, 0]
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const modelRef = useRef<THREE.Object3D | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const animationsRef = useRef<THREE.AnimationClip[]>([]);
  const activeActionRef = useRef<THREE.AnimationAction | null>(null);
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1.5, 4);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const clock = new THREE.Clock();
    
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (mixerRef.current) {
        mixerRef.current.update(clock.getDelta());
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, []);
  
  // Load 3D model
  useEffect(() => {
    if (!sceneRef.current) return;
    
    const loader = new GLTFLoader();
    
    loader.load(
      modelUrl,
      (gltf) => {
        // Remove previous model if exists
        if (modelRef.current) {
          sceneRef.current?.remove(modelRef.current);
        }
        
        const model = gltf.scene;
        model.scale.set(scale, scale, scale);
        model.position.set(position[0], position[1], position[2]);
        
        sceneRef.current?.add(model);
        modelRef.current = model;
        
        // Setup animations
        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          mixerRef.current = mixer;
          animationsRef.current = gltf.animations;
          
          // Play default animation
          const idleAnimation = gltf.animations.find(anim => anim.name === 'Idle') || gltf.animations[0];
          const action = mixer.clipAction(idleAnimation);
          action.play();
          activeActionRef.current = action;
        }
      },
      undefined,
      (error) => {
        console.error('Error loading 3D model:', error);
      }
    );
  }, [modelUrl, scale, position]);
  
  // Handle speaking state
  useEffect(() => {
    if (!mixerRef.current || animationsRef.current.length === 0) return;
    
    const speakingAnimation = animationsRef.current.find(anim => anim.name === 'Speaking');
    const idleAnimation = animationsRef.current.find(anim => anim.name === 'Idle') || animationsRef.current[0];
    
    if (speaking && speakingAnimation) {
      const newAction = mixerRef.current.clipAction(speakingAnimation);
      
      if (activeActionRef.current) {
        activeActionRef.current.crossFadeTo(newAction, 0.5, true);
      }
      
      newAction.play();
      activeActionRef.current = newAction;
    } else if (!speaking && idleAnimation) {
      const newAction = mixerRef.current.clipAction(idleAnimation);
      
      if (activeActionRef.current) {
        activeActionRef.current.crossFadeTo(newAction, 0.5, true);
      }
      
      newAction.play();
      activeActionRef.current = newAction;
    }
  }, [speaking]);
  
  // Handle emotion state
  useEffect(() => {
    if (!mixerRef.current || animationsRef.current.length === 0) return;
    
    const emotionAnimation = animationsRef.current.find(anim => anim.name === emotion);
    
    if (emotionAnimation) {
      const newAction = mixerRef.current.clipAction(emotionAnimation);
      
      if (activeActionRef.current) {
        activeActionRef.current.crossFadeTo(newAction, 0.5, true);
      }
      
      newAction.play();
      activeActionRef.current = newAction;
    }
  }, [emotion]);
  
  return <div ref={containerRef} className="avatar-container" />;
};

export default Avatar;
```

## Database Schema

The application uses MongoDB with the following collections:

### Users
Stores user account information.
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String,
  password: String (hashed),
  phoneNumber: String,
  role: String (enum: 'student', 'admin'),
  createdAt: Date,
  updatedAt: Date
}
```

### Avatars
Stores digital human avatar information.
```javascript
{
  _id: ObjectId,
  name: String,
  modelUrl: String,
  thumbnailUrl: String,
  voiceId: String,
  characteristics: {
    personality: [String],
    specialization: [String],
    teachingStyle: [String]
  },
  isActive: Boolean,
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### Courses
Stores course information.
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  subject: String,
  gradeLevel: String,
  thumbnail: String,
  duration: String,
  skillLevels: [String],
  isActive: Boolean,
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### Modules
Stores course module information.
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  course: ObjectId (ref: 'Course'),
  order: Number,
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### Lessons
Stores lesson information.
```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  module: ObjectId (ref: 'Module'),
  order: Number,
  duration: String,
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### Exercises
Stores exercise information.
```javascript
{
  _id: ObjectId,
  title: String,
  instructions: String,
  lesson: ObjectId (ref: 'Lesson'),
  questions: [{
    text: String,
    type: String (enum: 'multiple_choice', 'free_text', etc.),
    options: [String],
    correctAnswer: String or [String],
    explanation: String
  }],
  difficulty: String,
  createdBy: ObjectId (ref: 'User'),
  createdAt: Date,
  updatedAt: Date
}
```

### Enrollments
Stores user course enrollments.
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User'),
  course: ObjectId (ref: 'Course'),
  status: String (enum: 'active', 'completed', 'dropped'),
  progress: Number,
  startDate: Date,
  completionDate: Date,
  lastAccessed: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Progress
Stores detailed user progress.
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User'),
  course: ObjectId (ref: 'Course'),
  module: ObjectId (ref: 'Module'),
  lesson: ObjectId (ref: 'Lesson'),
  exercise: ObjectId (ref: 'Exercise'),
  status: String (enum: 'not_started', 'in_progress', 'completed'),
  score: Number,
  timeSpent: Number,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Interactions
Stores user-tutor interactions.
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User'),
  sessionId: String,
  type: String (enum: 'question', 'response'),
  content: String,
  context: {
    course: ObjectId (ref: 'Course'),
    module: ObjectId (ref: 'Module'),
    lesson: ObjectId (ref: 'Lesson')
  },
  createdAt: Date
}
```

### MemoryRecords
Stores tutor memory records.
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User'),
  key: String,
  value: String,
  type: String (enum: 'short_term', 'long_term'),
  category: String,
  importance: Number,
  accessCount: Number,
  lastAccessed: Date,
  expiresAt: Date,
  context: Object,
  createdAt: Date,
  updatedAt: Date
}
```

## API Documentation

The application provides a RESTful API with the following endpoints:

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Courses

- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create new course (admin only)
- `PUT /api/courses/:id` - Update course (admin only)
- `DELETE /api/courses/:id` - Delete course (admin only)

### Modules

- `GET /api/modules` - Get all modules
- `GET /api/modules/:id` - Get module by ID
- `POST /api/modules` - Create new module (admin only)
- `PUT /api/modules/:id` - Update module (admin only)
- `DELETE /api/modules/:id` - Delete module (admin only)

### Lessons

- `GET /api/lessons` - Get all lessons
- `GET /api/lessons/:id` - Get lesson by ID
- `POST /api/lessons` - Create new lesson (admin only)
- `PUT /api/lessons/:id` - Update lesson (admin only)
- `DELETE /api/lessons/:id` - Delete lesson (admin only)

### Exercises

- `GET /api/exercises` - Get all exercises
- `GET /api/exercises/:id` - Get exercise by ID
- `POST /api/exercises` - Create new exercise (admin only)
- `PUT /api/exercises/:id` - Update exercise (admin only)
- `DELETE /api/exercises/:id` - Delete exercise (admin only)

### Avatars

- `GET /api/avatars` - Get all avatars
- `GET /api/avatars/:id` - Get avatar by ID
- `POST /api/avatars` - Create new avatar (admin only)
- `PUT /api/avatars/:id` - Update avatar (admin only)
- `DELETE /api/avatars/:id` - Delete avatar (admin only)

### Enrollments

- `GET /api/enrollments` - Get user enrollments
- `POST /api/enrollments` - Create new enrollment
- `PUT /api/enrollments/:id` - Update enrollment
- `DELETE /api/enrollments/:id` - Delete enrollment

### Progress

- `GET /api/progress` - Get user progress
- `POST /api/progress` - Create progress record
- `PUT /api/progress/:id` - Update progress record

### Interactions

- `GET /api/interactions` - Get user interactions
- `GET /api/interactions/session/:sessionId` - Get session interactions
- `POST /api/interactions` - Create new interaction
- `GET /api/interactions/recent` - Get recent interactions

### Memory

- `GET /api/memory` - Get memory records
- `GET /api/memory/key/:key` - Get memory record by key
- `POST /api/memory` - Create memory record
- `PUT /api/memory/:id` - Update memory record
- `DELETE /api/memory/:id` - Delete memory record

## Authentication System

The application uses JWT (JSON Web Tokens) for authentication:

1. User registers or logs in
2. Server validates credentials and generates a JWT
3. JWT is returned to the client and stored in localStorage
4. Client includes JWT in Authorization header for subsequent requests
5. Server validates JWT and grants access to protected resources

### Token Generation

```typescript
// utils/auth.ts
import jwt from 'jsonwebtoken';

export const generateToken = (userId: string) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your_jwt_secret_key',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};
```

### Authentication Middleware

```typescript
// middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface DecodedToken {
  id: string;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Check Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_jwt_secret_key'
    ) as DecodedToken;

    // Get user from database
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Admin only middleware
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
};
```

## Memory System

The memory system allows the virtual tutor to remember student interactions, preferences, and progress. It consists of two types of memory:

1. **Short-term memory**: Temporary information that expires after a certain period
2. **Long-term memory**: Persistent information that remains available across sessions

### Memory Record Structure

```typescript
// models/MemoryRecord.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IMemoryRecord extends Document {
  user: mongoose.Schema.Types.ObjectId;
  key: string;
  value: string;
  type: 'short_term' | 'long_term';
  category: string;
  importance: number;
  accessCount: number;
  lastAccessed: Date;
  expiresAt?: Date;
  context?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const MemoryRecordSchema: Schema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  key: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['short_term', 'long_term'],
    default: 'short_term'
  },
  category: {
    type: String,
    default: 'general'
  },
  importance: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },
  accessCount: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date
  },
  context: {
    type: Object
  }
}, {
  timestamps: true
});

// Compound index for efficient lookups
MemoryRecordSchema.index({ user: 1, key: 1 }, { unique: true });

// Set expiration date for short-term memory
MemoryRecordSchema.pre<IMemoryRecord>('save', function(next) {
  if (this.type === 'short_term' && !this.expiresAt) {
    // Short-term memory expires after 7 days by default
    const expirationDays = 7;
    this.expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);
  }
  next();
});

export default mongoose.model<IMemoryRecord>('MemoryRecord', MemoryRecordSchema);
```

### Memory Manager Component

The frontend includes a MemoryManager component that interfaces with the memory API:

```typescript
// components/MemoryManager.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MemoryManager.css';

interface MemoryRecord {
  key: string;
  value: string;
  type: 'short_term' | 'long_term';
  category: string;
  importance: number;
  accessCount: number;
  lastAccessed: Date;
}

interface MemoryManagerProps {
  userId: string;
  courseId?: string;
  onMemoryUpdate?: (memories: MemoryRecord[]) => void;
}

const MemoryManager: React.FC<MemoryManagerProps> = ({
  userId,
  courseId,
  onMemoryUpdate
}) => {
  const [memories, setMemories] = useState<MemoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Fetch memories on component mount
  useEffect(() => {
    fetchMemories();
  }, [userId, courseId]);

  // Fetch memories from API
  const fetchMemories = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      let url = '/api/memory';
      const params: any = {};
      
      if (courseId) {
        params.category = `course_${courseId}`;
      }
      
      const response = await axios.get(url, { params });
      setMemories(response.data.data);
      
      if (onMemoryUpdate) {
        onMemoryUpdate(response.data.data);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching memories:', error);
      setError('Failed to load memory records');
      setLoading(false);
    }
  };

  // Store a new memory or update existing one
  const storeMemory = async (
    key: string,
    value: string,
    type: 'short_term' | 'long_term' = 'short_term',
    category: string = 'general',
    importance: number = 1
  ) => {
    try {
      const payload = {
        key,
        value,
        type,
        category,
        importance,
        context: courseId ? { courseId } : undefined
      };
      
      const response = await axios.post('/api/memory', payload);
      
      // Update local state
      const updatedMemories = [...memories];
      const existingIndex = updatedMemories.findIndex(m => m.key === key);
      
      if (existingIndex >= 0) {
        updatedMemories[existingIndex] = response.data.data;
      } else {
        updatedMemories.push(response.data.data);
      }
      
      setMemories(updatedMemories);
      
      if (onMemoryUpdate) {
        onMemoryUpdate(updatedMemories);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error storing memory:', error);
      setError('Failed to store memory');
      throw error;
    }
  };

  // Retrieve a specific memory by key
  const retrieveMemory = async (key: string) => {
    try {
      const response = await axios.get(`/api/memory/key/${key}`);
      
      // Update local state to reflect access count change
      const updatedMemories = memories.map(memory => 
        memory.key === key ? response.data.data : memory
      );
      
      setMemories(updatedMemories);
      
      if (onMemoryUpdate) {
        onMemoryUpdate(updatedMemories);
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error retrieving memory:', error);
      return null;
    }
  };

  // Get memories by category
  const getMemoriesByCategory = (category: string) => {
    return memories.filter(memory => memory.category === category);
  };

  // Get memories by type
  const getMemoriesByType = (type: 'short_term' | 'long_term') => {
    return memories.filter(memory => memory.type === type);
  };

  // Get most important memories
  const getImportantMemories = (limit: number = 5) => {
    return [...memories]
      .sort((a, b) => b.importance - a.importance)
      .slice(0, limit);
  };

  // Get recently accessed memories
  const getRecentMemories = (limit: number = 5) => {
    return [...memories]
      .sort((a, b) => new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime())
      .slice(0, limit);
  };

  return {
    memories,
    loading,
    error,
    storeMemory,
    retrieveMemory,
    getMemoriesByCategory,
    getMemoriesByType,
    getImportantMemories,
    getRecentMemories,
    refreshMemories: fetchMemories
  };
};

export default MemoryManager;
```

## Speech Integration

The application integrates speech capabilities using the Web Speech API:

### Speech Recognition

```typescript
// components/SpeechRecognition.tsx
import React, { useState, useEffect } from 'react';
import './SpeechRecognition.css';

interface SpeechRecognitionProps {
  onResult: (transcript: string) => void;
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

const SpeechRecognition: React.FC<SpeechRecognitionProps> = ({
  onResult,
  language = 'en-US',
  continuous = false,
  interimResults = true
}) => {
  const [listening, setListening] = useState<boolean>(false);
  const [supported, setSupported] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  // Check if browser supports speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false);
      setError('Speech recognition is not supported in this browser.');
    }
  }, []);
  
  const toggleListening = () => {
    if (!supported) return;
    
    if (listening) {
      stopListening();
    } else {
      startListening();
    }
  };
  
  const startListening = () => {
    setError('');
    
    // Create speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Configure recognition
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    
    // Set up event handlers
    recognition.onstart = () => {
      setListening(true);
    };
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      onResult(transcript);
    };
    
    recognition.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      setListening(false);
    };
    
    recognition.onend = () => {
      setListening(false);
    };
    
    // Start recognition
    try {
      recognition.start();
    } catch (error) {
      setError(`Failed to start speech recognition: ${error.message}`);
    }
    
    // Store recognition instance for cleanup
    (window as any).currentRecognition = recognition;
  };
  
  const stopListening = () => {
    if ((window as any).currentRecognition) {
      (window as any).currentRecognition.stop();
      (window as any).currentRecognition = null;
    }
    
    setListening(false);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ((window as any).currentRecognition) {
        (window as any).currentRecognition.stop();
        (window as any).currentRecognition = null;
      }
    };
  }, []);
  
  if (!supported) {
    return (
      <div className="speech-recognition">
        <div className="speech-error">
          {error}
          <p>Please try using Chrome, Edge, or Safari for speech recognition.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="speech-recognition">
      <button
        className={`speech-button ${listening ? 'listening' : ''}`}
        onClick={toggleListening}
        title={listening ? 'Stop listening' : 'Start listening'}
      >
        <span className="speech-icon">{listening ? '🎤' : '🎤'}</span>
        {listening ? 'Listening...' : 'Speak'}
      </button>
      
      {error && <div className="speech-error">{error}</div>}
    </div>
  );
};

export default SpeechRecognition;
```

### Speech Synthesis

```typescript
// components/SpeechSynthesis.tsx
import React, { useState, useEffect } from 'react';
import './SpeechSynthesis.css';

interface SpeechSynthesisProps {
  text: string;
  voice?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  autoPlay?: boolean;
}

const SpeechSynthesis: React.FC<SpeechSynthesisProps> = ({
  text,
  voice = '',
  rate = 1,
  pitch = 1,
  volume = 1,
  onStart,
  onEnd,
  autoPlay = false
}) => {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [supported, setSupported] = useState<boolean>(true);

  useEffect(() => {
    // Check if browser supports speech synthesis
    if (!('speechSynthesis' in window)) {
      setSupported(false);
      setError('Speech synthesis is not supported in this browser.');
      return;
    }

    // Get available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    loadVoices();

    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // Auto-play if enabled
    if (autoPlay && text) {
      speak();
    }

    // Cleanup
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [autoPlay, text]);

  const speak = () => {
    if (!supported || !text) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice if specified
    if (voice && voices.length > 0) {
      const selectedVoice = voices.find(v => v.name === voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    // Set other properties
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    
    // Set event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      if (onStart) onStart();
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      if (onEnd) onEnd();
    };
    
    utterance.onerror = (event) => {
      setError(`Speech synthesis error: ${event.error}`);
      setIsSpeaking(false);
      setIsPaused(false);
    };
    
    // Start speaking
    window.speechSynthesis.speak(utterance);
  };

  const pause = () => {
    if (!supported || !isSpeaking) return;
    
    window.speechSynthesis.pause();
    setIsPaused(true);
  };

  const resume = () => {
    if (!supported || !isPaused) return;
    
    window.speechSynthesis.resume();
    setIsPaused(false);
  };

  const stop = () => {
    if (!supported) return;
    
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  return (
    <div className="speech-synthesis">
      {!supported ? (
        <div className="speech-error">
          {error}
          <p>Please try using Chrome, Edge, or Safari for speech synthesis.</p>
        </div>
      ) : (
        <>
          <div className="speech-controls">
            {!isSpeaking ? (
              <button 
                className="speech-button play"
                onClick={speak}
                disabled={!text}
                title="Speak"
              >
                <span className="speech-icon">🔊</span>
              </button>
            ) : isPaused ? (
              <button 
                className="speech-button resume"
                onClick={resume}
                title="Resume"
              >
                <span className="speech-icon">▶️</span>
              </button>
            ) : (
              <button 
                className="speech-button pause"
                onClick={pause}
                title="Pause"
              >
                <span className="speech-icon">⏸️</span>
              </button>
            )}
            
            {(isSpeaking || isPaused) && (
              <button 
                className="speech-button stop"
                onClick={stop}
                title="Stop"
              >
                <span className="speech-icon">⏹️</span>
              </button>
            )}
          </div>
          
          {error && <div className="speech-error">{error}</div>}
        </>
      )}
    </div>
  );
};

export default SpeechSynthesis;
```

## Real-time Communication

The application uses Socket.io for real-time communication between the student and the virtual tutor:

### Server-side Socket Setup

```typescript
// server.ts
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Handle tutor message from client
  socket.on('tutor_message', async (data) => {
    try {
      const { sessionId, content, courseId, memory } = data;
      
      // Process the message and generate a response
      // This would typically involve an AI service or custom logic
      const response = await generateTutorResponse(content, memory);
      
      // Emit response back to client
      socket.emit('tutor_response', {
        sessionId,
        content: response.text,
        emotion: response.emotion
      });
      
      // Record the interaction in the database
      await recordInteraction(sessionId, 'response', response.text, { courseId });
    } catch (error) {
      console.error('Error processing tutor message:', error);
      socket.emit('error', { message: 'Failed to process message' });
    }
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Client-side Socket Integration

```typescript
// pages/TutorSession.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';

// Socket connection setup
const socket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');

const TutorSession: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');
  
  // Initialize session
  useEffect(() => {
    // Generate a unique session ID
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);
    
    // Socket event listeners
    socket.on('tutor_response', (data) => {
      if (data.sessionId === sessionId) {
        // Add tutor message
        setMessages(prev => [...prev, {
          id: `msg_${Date.now()}`,
          sender: 'tutor',
          content: data.content,
          timestamp: new Date()
        }]);
      }
    });
    
    // Cleanup
    return () => {
      socket.off('tutor_response');
    };
  }, [sessionId]);
  
  // Handle sending message
  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Emit message to socket server
    socket.emit('tutor_message', {
      sessionId,
      content: input,
      courseId
    });
    
    // Clear input
    setInput('');
  };
  
  return (
    <div className="tutor-session">
      {/* Tutor session UI */}
    </div>
  );
};

export default TutorSession;
```

## Performance Considerations

### Frontend Optimization

1. **Code Splitting**: The application uses React's lazy loading to split code into smaller chunks:
   ```typescript
   // App.tsx
   import React, { lazy, Suspense } from 'react';
   
   const Dashboard = lazy(() => import('./pages/Dashboard'));
   const TutorSession = lazy(() => import('./pages/TutorSession'));
   
   const App: React.FC = () => {
     return (
       <Suspense fallback={<div>Loading...</div>}>
         <Routes>
           <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/tutor-session/:courseId" element={<TutorSession />} />
         </Routes>
       </Suspense>
     );
   };
   ```

2. **Asset Optimization**:
   - Images are compressed and served in modern formats (WebP)
   - 3D models are optimized for web delivery (compressed glTF/GLB)
   - CSS is minified and critical CSS is inlined

3. **Memoization**: React's `useMemo` and `useCallback` are used to prevent unnecessary re-renders:
   ```typescript
   const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
   const memoizedCallback = useCallback(() => doSomething(a, b), [a, b]);
   ```

### Backend Optimization

1. **Database Indexing**: MongoDB collections have appropriate indexes for common queries:
   ```typescript
   // Example index for course queries
   CourseSchema.index({ subject: 1, skillLevels: 1 });
   ```

2. **Caching**: Frequently accessed data is cached:
   ```typescript
   // Example caching middleware
   import NodeCache from 'node-cache';
   
   const cache = new NodeCache({ stdTTL: 300 }); // 5 minutes TTL
   
   export const cacheMiddleware = (req, res, next) => {
     const key = req.originalUrl;
     const cachedResponse = cache.get(key);
     
     if (cachedResponse) {
       return res.json(cachedResponse);
     }
     
     res.originalJson = res.json;
     res.json = (body) => {
       cache.set(key, body);
       res.originalJson(body);
     };
     
     next();
   };
   ```

3. **Pagination**: API endpoints that return lists implement pagination:
   ```typescript
   // Example pagination in course controller
   export const getCourses = async (req: Request, res: Response) => {
     const page = parseInt(req.query.page as string) || 1;
     const limit = parseInt(req.query.limit as string) || 10;
     const skip = (page - 1) * limit;
     
     const courses = await Course.find()
       .skip(skip)
       .limit(limit);
     
     const total = await Course.countDocuments();
     
     res.json({
       success: true,
       count: courses.length,
       pagination: {
         total,
         page,
         pages: Math.ceil(total / limit)
       },
       data: courses
     });
   };
   ```

## Security Considerations

1. **Input Validation**: All user inputs are validated using middleware:
   ```typescript
   // Example validation middleware
   import { body, validationResult } from 'express-validator';
   
   export const validateCourseInput = [
     body('title').trim().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
     body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
     body('subject').trim().notEmpty().withMessage('Subject is required'),
     
     (req, res, next) => {
       const errors = validationResult(req);
       if (!errors.isEmpty()) {
         return res.status(400).json({
           success: false,
           errors: errors.array()
         });
       }
       next();
     }
   ];
   ```

2. **Password Security**: Passwords are hashed using bcrypt:
   ```typescript
   // In User model
   UserSchema.pre<IUser>('save', async function(next) {
     if (!this.isModified('password')) {
       next();
     }
   
     const salt = await bcrypt.genSalt(10);
     this.password = await bcrypt.hash(this.password, salt);
   });
   ```

3. **XSS Protection**: React automatically escapes content, and additional measures are taken:
   ```typescript
   // Example sanitization
   import DOMPurify from 'dompurify';
   
   const sanitizeHtml = (html) => {
     return DOMPurify.sanitize(html, {
       ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
       ALLOWED_ATTR: ['href', 'target']
     });
   };
   ```

4. **CSRF Protection**: CSRF tokens are used for sensitive operations:
   ```typescript
   // Example CSRF middleware
   import csurf from 'csurf';
   
   const csrfProtection = csurf({ cookie: true });
   
   app.use(csrfProtection);
   app.use((req, res, next) => {
     res.cookie('XSRF-TOKEN', req.csrfToken());
     next();
   });
   ```

5. **Rate Limiting**: API endpoints are protected against abuse:
   ```typescript
   // Example rate limiting middleware
   import rateLimit from 'express-rate-limit';
   
   const apiLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
     message: 'Too many requests from this IP, please try again after 15 minutes'
   });
   
   app.use('/api/', apiLimiter);
   ```
