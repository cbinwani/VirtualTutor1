// Shared type definitions for Virtual Tutor application

// User related types
export interface User {
  userId: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  preferences: UserPreferences;
  enrolledCourses: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  avatarId: string;
  notificationSettings: {
    email: boolean;
    sms: boolean;
  };
  courseInterests: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  learningGoals: string[];
  studySchedule: {
    preferredDays: string[];
    preferredTime: string;
  };
}

// Course related types
export interface Course {
  courseId: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  topics: Topic[];
  prerequisites: string[];
  objectives: string[];
  materials: Material[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Topic {
  topicId: string;
  title: string;
  description: string;
  estimatedDuration: string;
  order: number;
}

export interface Material {
  materialId: string;
  title: string;
  type: 'document' | 'video' | 'audio' | 'image' | 'quiz';
  url: string;
  topicId?: string;
}

// Tutor session related types
export interface TutorSession {
  sessionId: string;
  userId: string;
  courseId: string;
  topicId: string;
  avatarId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  messages: Message[];
  topicsCovered: string[];
  performanceMetrics: PerformanceMetrics;
}

export interface Message {
  messageId: string;
  sessionId: string;
  sender: 'user' | 'tutor';
  content: string;
  timestamp: Date;
  audioUrl?: string;
}

export interface PerformanceMetrics {
  correctAnswers?: number;
  totalQuestions?: number;
  improvementAreas: string[];
}

// Avatar related types
export interface Avatar {
  avatarId: string;
  name: string;
  gender: 'male' | 'female' | 'non-binary';
  style: 'professional' | 'casual' | 'friendly';
  description: string;
  previewImageUrl: string;
  modelUrl: string;
  voicePreviewUrl: string;
  animations: Animation[];
  specialties: string[];
  personality: string;
}

export interface Animation {
  name: string;
  url: string;
}

// LLM and RAG related types
export interface LLMConfig {
  model: string;
  temperature: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
}

export interface RAGContext {
  courseId: string;
  topicId?: string;
  materials: string[];
  previousMessages: number;
}

// Admin related types
export interface AdminUser extends User {
  role: 'admin' | 'super-admin';
  permissions: string[];
}

export interface AnalyticsData {
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
  };
  courseMetrics: {
    totalEnrollments: number;
    mostPopularCourses: {
      courseId: string;
      title: string;
      enrollments: number;
    }[];
  };
  sessionMetrics: {
    totalSessions: number;
    averageSessionDuration: number;
    peakUsageTimes: {
      day: string;
      hour: number;
      sessionCount: number;
    }[];
  };
  performanceMetrics: {
    averageCompletionRate: number;
    commonImprovementAreas: {
      area: string;
      frequency: number;
    }[];
  };
}
