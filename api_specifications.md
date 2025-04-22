# API Specifications for Virtual Tutor Application

## Overview
This document outlines the API specifications for the Virtual Tutor application, detailing the endpoints, request/response formats, and authentication requirements for each service.

## Authentication

### Base URL
```
/api/auth
```

### Endpoints

#### Register User
- **URL**: `/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "student@example.com",
    "phone": "+1234567890",
    "password": "securePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Registration successful",
    "userId": "user123",
    "token": "jwt-token-here"
  }
  ```

#### Login
- **URL**: `/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "student@example.com",
    "password": "securePassword123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "userId": "user123",
    "token": "jwt-token-here",
    "expiresIn": 3600
  }
  ```

#### Verify Email
- **URL**: `/verify-email`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "student@example.com",
    "code": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Email verified successfully"
  }
  ```

#### Verify Phone
- **URL**: `/verify-phone`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "phone": "+1234567890",
    "code": "123456"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Phone verified successfully"
  }
  ```

#### Reset Password
- **URL**: `/reset-password`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "student@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Password reset link sent to email"
  }
  ```

#### Logout
- **URL**: `/logout`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

## User Management

### Base URL
```
/api/users
```

### Endpoints

#### Get User Profile
- **URL**: `/profile`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "userId": "user123",
    "email": "student@example.com",
    "phone": "+1234567890",
    "firstName": "John",
    "lastName": "Doe",
    "preferences": {
      "avatarId": "avatar1",
      "notificationSettings": {
        "email": true,
        "sms": false
      }
    },
    "enrolledCourses": ["course1", "course2"]
  }
  ```

#### Update User Profile
- **URL**: `/profile`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "preferences": {
      "avatarId": "avatar2",
      "notificationSettings": {
        "email": true,
        "sms": true
      }
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully"
  }
  ```

#### Set User Preferences
- **URL**: `/preferences`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "courseInterests": ["math", "science", "history"],
    "skillLevel": "intermediate",
    "learningGoals": ["improve grades", "prepare for exam"],
    "studySchedule": {
      "preferredDays": ["monday", "wednesday", "friday"],
      "preferredTime": "evening"
    }
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Preferences saved successfully"
  }
  ```

#### Get User Learning History
- **URL**: `/learning-history`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Query Parameters**:
  - `courseId` (optional): Filter by course
  - `startDate` (optional): Filter by start date
  - `endDate` (optional): Filter by end date
- **Response**:
  ```json
  {
    "sessions": [
      {
        "sessionId": "session1",
        "courseId": "course1",
        "startTime": "2025-04-15T14:30:00Z",
        "endTime": "2025-04-15T15:30:00Z",
        "duration": 3600,
        "topicsCovered": ["algebra", "equations"],
        "performanceMetrics": {
          "correctAnswers": 8,
          "totalQuestions": 10,
          "improvementAreas": ["quadratic equations"]
        }
      }
    ],
    "totalSessions": 10,
    "totalDuration": 36000
  }
  ```

## Courses

### Base URL
```
/api/courses
```

### Endpoints

#### Get Available Courses
- **URL**: `/`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Query Parameters**:
  - `category` (optional): Filter by category
  - `level` (optional): Filter by difficulty level
  - `page` (optional): Pagination page number
  - `limit` (optional): Items per page
- **Response**:
  ```json
  {
    "courses": [
      {
        "courseId": "course1",
        "title": "Algebra Fundamentals",
        "description": "Learn the basics of algebra",
        "category": "Mathematics",
        "level": "beginner",
        "duration": "8 weeks",
        "topics": ["equations", "inequalities", "functions"],
        "enrollmentCount": 1250
      }
    ],
    "totalCourses": 50,
    "page": 1,
    "limit": 10
  }
  ```

#### Get Course Details
- **URL**: `/{courseId}`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "courseId": "course1",
    "title": "Algebra Fundamentals",
    "description": "Learn the basics of algebra",
    "category": "Mathematics",
    "level": "beginner",
    "duration": "8 weeks",
    "topics": [
      {
        "topicId": "topic1",
        "title": "Linear Equations",
        "description": "Solving linear equations",
        "estimatedDuration": "2 hours"
      }
    ],
    "prerequisites": ["Basic arithmetic"],
    "objectives": ["Solve linear equations", "Graph functions"],
    "materials": [
      {
        "materialId": "material1",
        "title": "Introduction to Algebra",
        "type": "document",
        "url": "/materials/intro-algebra.pdf"
      }
    ]
  }
  ```

#### Enroll in Course
- **URL**: `/{courseId}/enroll`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Successfully enrolled in course",
    "enrollmentId": "enrollment123"
  }
  ```

#### Get Course Progress
- **URL**: `/{courseId}/progress`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "courseId": "course1",
    "progress": 65,
    "completedTopics": ["topic1", "topic2"],
    "currentTopic": "topic3",
    "nextTopic": "topic4",
    "assessmentScores": [
      {
        "assessmentId": "assessment1",
        "score": 85,
        "date": "2025-04-10T15:30:00Z"
      }
    ],
    "improvementAreas": ["quadratic equations", "graphing"]
  }
  ```

## Tutor Interaction

### Base URL
```
/api/tutor
```

### Endpoints

#### Start Session
- **URL**: `/session/start`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "courseId": "course1",
    "topicId": "topic1",
    "avatarId": "avatar1",
    "llmConfig": {
      "model": "gpt-4",
      "temperature": 0.7
    }
  }
  ```
- **Response**:
  ```json
  {
    "sessionId": "session123",
    "avatarDetails": {
      "avatarId": "avatar1",
      "name": "Professor Alex",
      "imageUrl": "/avatars/alex.png"
    },
    "welcomeMessage": "Hello! I'm Professor Alex. Ready to learn about Linear Equations?"
  }
  ```

#### Send Message
- **URL**: `/session/{sessionId}/message`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**:
  ```json
  {
    "message": "Can you explain how to solve x + 5 = 10?",
    "messageType": "text"
  }
  ```
- **Response**:
  ```json
  {
    "messageId": "msg123",
    "response": "To solve x + 5 = 10, you need to isolate the variable x. Subtract 5 from both sides of the equation: x + 5 - 5 = 10 - 5. This gives you x = 5.",
    "responseType": "text",
    "audioUrl": "/audio/response-msg123.mp3",
    "suggestedFollowUps": [
      "Can you show me another example?",
      "What about equations with variables on both sides?"
    ]
  }
  ```

#### Send Voice Message
- **URL**: `/session/{sessionId}/voice-message`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Request Body**: Form data with audio file
- **Response**: Same as Send Message

#### End Session
- **URL**: `/session/{sessionId}/end`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "sessionId": "session123",
    "duration": 1800,
    "topicsCovered": ["linear equations"],
    "summary": "In this session, we covered solving basic linear equations and practiced with several examples.",
    "nextSteps": "Next time, we can explore equations with variables on both sides.",
    "improvementAreas": ["Practice more word problems"]
  }
  ```

#### Get Session History
- **URL**: `/session/{sessionId}/history`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "sessionId": "session123",
    "startTime": "2025-04-20T14:30:00Z",
    "endTime": "2025-04-20T15:30:00Z",
    "messages": [
      {
        "messageId": "msg1",
        "sender": "user",
        "content": "Can you explain how to solve x + 5 = 10?",
        "timestamp": "2025-04-20T14:35:00Z"
      },
      {
        "messageId": "msg2",
        "sender": "tutor",
        "content": "To solve x + 5 = 10, you need to isolate the variable x. Subtract 5 from both sides of the equation: x + 5 - 5 = 10 - 5. This gives you x = 5.",
        "timestamp": "2025-04-20T14:35:10Z"
      }
    ]
  }
  ```

## Avatars

### Base URL
```
/api/avatars
```

### Endpoints

#### Get Available Avatars
- **URL**: `/`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "avatars": [
      {
        "avatarId": "avatar1",
        "name": "Professor Alex",
        "gender": "male",
        "style": "professional",
        "previewImageUrl": "/avatars/alex-preview.png",
        "voicePreviewUrl": "/avatars/alex-voice.mp3",
        "specialties": ["mathematics", "physics"]
      }
    ]
  }
  ```

#### Get Avatar Details
- **URL**: `/{avatarId}`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {token}`
- **Response**:
  ```json
  {
    "avatarId": "avatar1",
    "name": "Professor Alex",
    "gender": "male",
    "style": "professional",
    "description": "Professor Alex is a friendly and patient tutor specializing in mathematics and physics.",
    "previewImageUrl": "/avatars/alex-preview.png",
    "modelUrl": "/avatars/alex-model.glb",
    "voicePreviewUrl": "/avatars/alex-voice.mp3",
    "animations": [
      {
        "name": "greeting",
        "url": "/avatars/alex-greeting.glb"
      }
    ],
    "specialties": ["mathematics", "physics"],
    "personality": "patient, encouraging, detail-oriented"
  }
  ```

## Admin

### Base URL
```
/api/admin
```

### Endpoints

#### Get Users
- **URL**: `/users`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {admin-token}`
- **Query Parameters**:
  - `page` (optional): Pagination page number
  - `limit` (optional): Items per page
  - `search` (optional): Search by name or email
- **Response**:
  ```json
  {
    "users": [
      {
        "userId": "user123",
        "email": "student@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "registrationDate": "2025-03-15T10:30:00Z",
        "lastActive": "2025-04-20T15:45:00Z",
        "enrolledCourses": 3
      }
    ],
    "totalUsers": 500,
    "page": 1,
    "limit": 10
  }
  ```

#### Get Course Management
- **URL**: `/courses`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {admin-token}`
- **Query Parameters**:
  - `page` (optional): Pagination page number
  - `limit` (optional): Items per page
  - `category` (optional): Filter by category
- **Response**:
  ```json
  {
    "courses": [
      {
        "courseId": "course1",
        "title": "Algebra Fundamentals",
        "category": "Mathematics",
        "level": "beginner",
        "enrollmentCount": 1250,
        "lastUpdated": "2025-04-01T09:15:00Z",
        "status": "active"
      }
    ],
    "totalCourses": 50,
    "page": 1,
    "limit": 10
  }
  ```

#### Create Course
- **URL**: `/courses`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {admin-token}`
- **Request Body**:
  ```json
  {
    "title": "Introduction to Calculus",
    "description": "Learn the fundamentals of calculus",
    "category": "Mathematics",
    "level": "intermediate",
    "topics": [
      {
        "title": "Limits",
        "description": "Understanding limits and continuity",
        "estimatedDuration": "3 hours"
      }
    ],
    "prerequisites": ["Algebra", "Trigonometry"],
    "objectives": ["Understand limits", "Calculate derivatives"]
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "Course created successfully",
    "courseId": "course123"
  }
  ```

#### Update Course
- **URL**: `/courses/{courseId}`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer {admin-token}`
- **Request Body**: Same as Create Course
- **Response**:
  ```json
  {
    "success": true,
    "message": "Course updated successfully"
  }
  ```

#### Upload Course Material
- **URL**: `/courses/{courseId}/materials`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer {admin-token}`
- **Request Body**: Form data with file and metadata
- **Response**:
  ```json
  {
    "success": true,
    "message": "Material uploaded successfully",
    "materialId": "material123",
    "url": "/materials/calculus-intro.pdf"
  }
  ```

#### Get Analytics
- **URL**: `/analytics`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer {admin-token}`
- **Query Parameters**:
  - `startDate` (optional): Filter by start date
  - `endDate` (optional): Filter by end date
  - `courseId` (optional): Filter by course
- **Response**:
  ```json
  {
    "userMetrics": {
      "totalUsers": 5000,
      "activeUsers": 3200,
      "newUsers": 450
    },
    "courseMetrics": {
      "totalEnrollments": 12500,
      "mostPopularCourses": [
        {
          "courseId": "course1",
          "title": "Algebra Fundamentals",
          "enrollments": 1250
        }
      ]
    },
    "sessionMetrics": {
      "totalSessions": 25000,
      "averageSessionDuration": 1800,
      "peakUsageTimes": [
        {
          "day": "Monday",
          "hour": 19,
          "sessionCount": 1500
        }
      ]
    },
    "performanceMetrics": {
      "averageCompletionRate": 78,
      "commonImprovementAreas": [
        {
          "area": "quadratic equations",
          "frequency": 350
        }
      ]
    }
  }
  ```

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional error details
  }
}
```

Common error codes:
- `AUTHENTICATION_ERROR`: Invalid or expired authentication
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid request parameters
- `RESOURCE_NOT_FOUND`: Requested resource does not exist
- `INTERNAL_ERROR`: Server-side error

## Versioning

API versioning is handled through the URL path:
```
/api/v1/resource
```

This specification covers version 1 of the API. Future versions will be accessible through updated path prefixes.
