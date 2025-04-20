# Virtual Tutor Application - Database Schema

## Overview

This document outlines the database schema for the Virtual Tutor application. We'll be using MongoDB as our database, with Mongoose as the ODM (Object Data Modeling) library for Node.js.

## Collections

### 1. Users

```typescript
interface User {
  _id: ObjectId;
  email: string;
  phoneNumber: string;
  password: string; // Hashed
  firstName: string;
  lastName: string;
  role: 'student' | 'admin';
  profilePicture?: string;
  preferredAvatar?: ObjectId; // Reference to Avatar
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
}
```

### 2. Avatars

```typescript
interface Avatar {
  _id: ObjectId;
  name: string;
  modelUrl: string;
  thumbnailUrl: string;
  voiceId: string;
  characteristics: {
    gender?: string;
    accent?: string;
    personality?: string;
    specialization?: string[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. Courses

```typescript
interface Course {
  _id: ObjectId;
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  thumbnail: string;
  duration: number; // In minutes
  skillLevels: ['beginner' | 'intermediate' | 'advanced'];
  createdBy: ObjectId; // Reference to User (admin)
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4. Modules

```typescript
interface Module {
  _id: ObjectId;
  courseId: ObjectId; // Reference to Course
  title: string;
  description: string;
  order: number;
  estimatedDuration: number; // In minutes
  createdAt: Date;
  updatedAt: Date;
}
```

### 5. Lessons

```typescript
interface Lesson {
  _id: ObjectId;
  moduleId: ObjectId; // Reference to Module
  title: string;
  description: string;
  content: string; // Rich text or JSON structure
  order: number;
  estimatedDuration: number; // In minutes
  resources: {
    type: 'video' | 'document' | 'link' | 'image';
    url: string;
    title: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 6. Exercises

```typescript
interface Exercise {
  _id: ObjectId;
  lessonId: ObjectId; // Reference to Lesson
  title: string;
  description: string;
  type: 'quiz' | 'assignment' | 'practice' | 'discussion';
  difficulty: 'easy' | 'medium' | 'hard';
  questions: {
    questionText: string;
    questionType: 'multiple-choice' | 'true-false' | 'fill-blank' | 'open-ended';
    options?: string[]; // For multiple-choice
    correctAnswer?: string | string[]; // May be empty for open-ended
    explanation?: string;
    points: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 7. Enrollments

```typescript
interface Enrollment {
  _id: ObjectId;
  userId: ObjectId; // Reference to User (student)
  courseId: ObjectId; // Reference to Course
  enrollmentDate: Date;
  currentModule: ObjectId; // Reference to Module
  currentLesson: ObjectId; // Reference to Lesson
  progress: number; // Percentage
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  lastAccessDate: Date;
  completionDate?: Date;
  certificate?: {
    issued: boolean;
    issuedDate?: Date;
    certificateUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 8. Progress

```typescript
interface Progress {
  _id: ObjectId;
  userId: ObjectId; // Reference to User (student)
  enrollmentId: ObjectId; // Reference to Enrollment
  lessonId: ObjectId; // Reference to Lesson
  exerciseId?: ObjectId; // Reference to Exercise
  status: 'not-started' | 'in-progress' | 'completed';
  score?: number;
  timeSpent: number; // In seconds
  completedAt?: Date;
  responses?: {
    questionIndex: number;
    userAnswer: string | string[];
    isCorrect: boolean;
    timeTaken: number; // In seconds
  }[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 9. Interactions

```typescript
interface Interaction {
  _id: ObjectId;
  userId: ObjectId; // Reference to User (student)
  sessionId: string;
  type: 'question' | 'response' | 'feedback' | 'hint';
  content: string;
  context: {
    courseId?: ObjectId;
    lessonId?: ObjectId;
    exerciseId?: ObjectId;
  };
  timestamp: Date;
  metadata?: {
    sentiment?: string;
    topics?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
  };
}
```

### 10. MemoryRecords

```typescript
interface MemoryRecord {
  _id: ObjectId;
  userId: ObjectId; // Reference to User (student)
  type: 'short-term' | 'long-term';
  category: 'preference' | 'performance' | 'interaction' | 'mistake' | 'strength';
  key: string;
  value: any; // Could be string, number, boolean, or complex object
  context: {
    courseId?: ObjectId;
    lessonId?: ObjectId;
    exerciseId?: ObjectId;
  };
  importance: number; // 1-10 scale
  expiresAt?: Date; // For short-term memories
  createdAt: Date;
  updatedAt: Date;
  lastAccessed?: Date;
  accessCount: number;
}
```

### 11. PerformanceAnalytics

```typescript
interface PerformanceAnalytic {
  _id: ObjectId;
  userId: ObjectId; // Reference to User (student)
  courseId: ObjectId; // Reference to Course
  timeframe: 'daily' | 'weekly' | 'monthly' | 'course';
  date: Date;
  metrics: {
    timeSpent: number; // In minutes
    lessonsCompleted: number;
    exercisesCompleted: number;
    averageScore: number;
    strengths: {
      topic: string;
      score: number;
    }[];
    weaknesses: {
      topic: string;
      score: number;
    }[];
    improvement: {
      topic: string;
      previousScore: number;
      currentScore: number;
      delta: number;
    }[];
  };
  recommendations: {
    type: 'lesson' | 'exercise' | 'resource';
    referenceId: ObjectId;
    reason: string;
    priority: number; // 1-10 scale
  }[];
  createdAt: Date;
  updatedAt: Date;
}
```

### 12. Notifications

```typescript
interface Notification {
  _id: ObjectId;
  userId: ObjectId; // Reference to User
  title: string;
  message: string;
  type: 'reminder' | 'achievement' | 'feedback' | 'system';
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
  expiresAt?: Date;
}
```

### 13. Feedback

```typescript
interface Feedback {
  _id: ObjectId;
  userId: ObjectId; // Reference to User (student)
  courseId?: ObjectId; // Reference to Course
  lessonId?: ObjectId; // Reference to Lesson
  exerciseId?: ObjectId; // Reference to Exercise
  rating: number; // 1-5 scale
  comment?: string;
  category: 'content' | 'avatar' | 'interface' | 'technical' | 'general';
  status: 'submitted' | 'reviewed' | 'addressed';
  adminResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Relationships

1. **User to Enrollments**: One-to-Many (A user can enroll in multiple courses)
2. **User to Progress**: One-to-Many (A user has progress records for multiple lessons/exercises)
3. **User to MemoryRecords**: One-to-Many (A user has multiple memory records)
4. **Course to Modules**: One-to-Many (A course contains multiple modules)
5. **Module to Lessons**: One-to-Many (A module contains multiple lessons)
6. **Lesson to Exercises**: One-to-Many (A lesson contains multiple exercises)
7. **User to Interactions**: One-to-Many (A user has multiple interaction records)
8. **User to PerformanceAnalytics**: One-to-Many (A user has multiple performance analytics records)
9. **User to Notifications**: One-to-Many (A user receives multiple notifications)
10. **User to Feedback**: One-to-Many (A user can provide multiple feedback entries)

## Indexes

1. User email (unique)
2. User phoneNumber (unique)
3. Course title
4. Enrollment userId + courseId (compound)
5. Progress userId + lessonId (compound)
6. Interaction userId + timestamp (compound)
7. MemoryRecord userId + key (compound)
8. PerformanceAnalytic userId + courseId + date (compound)

## Data Validation

- Email format validation
- Phone number format validation
- Password strength requirements
- Required fields validation
- Enum value validation for fields with predefined options

## Data Security

- Passwords stored with bcrypt hashing
- Sensitive user information encrypted
- Access control based on user roles
- Data validation before storage
- Regular backups
