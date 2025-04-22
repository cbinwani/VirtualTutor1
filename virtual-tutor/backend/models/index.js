// Models for Virtual Tutor application
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User Schema
const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  preferences: {
    avatarId: {
      type: Schema.Types.ObjectId,
      ref: 'Avatar'
    },
    notificationSettings: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    },
    courseInterests: [String],
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    learningGoals: [String],
    studySchedule: {
      preferredDays: [String],
      preferredTime: String
    }
  },
  enrolledCourses: [{
    type: Schema.Types.ObjectId,
    ref: 'Course'
  }],
  performanceHistory: [{
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course'
    },
    date: {
      type: Date,
      default: Date.now
    },
    correctAnswers: Number,
    totalQuestions: Number,
    score: Number
  }],
  improvementAreas: [{
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course'
    },
    areas: [String],
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }],
  isVerified: {
    email: {
      type: Boolean,
      default: false
    },
    phone: {
      type: Boolean,
      default: false
    }
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'super-admin'],
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
});

// Course Schema
const CourseSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  duration: String,
  topics: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    estimatedDuration: String,
    order: {
      type: Number,
      required: true
    }
  }],
  prerequisites: [String],
  objectives: [String],
  materials: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['document', 'video', 'audio', 'image', 'quiz'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    content: String, // For RAG indexing
    topicId: String
  }],
  enrollmentCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Session Schema
const SessionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  topicId: String,
  avatarId: {
    type: Schema.Types.ObjectId,
    ref: 'Avatar'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: Date,
  duration: Number,
  currentState: Schema.Types.Mixed, // For short-term memory
  messages: [{
    type: Schema.Types.ObjectId,
    ref: 'Message'
  }],
  topicsCovered: [String],
  completedExercises: [String],
  nextExerciseId: String,
  progress: Number,
  performanceMetrics: {
    correctAnswers: Number,
    totalQuestions: Number,
    improvementAreas: [String]
  },
  llmConfig: {
    model: String,
    temperature: Number
  }
});

// Message Schema
const MessageSchema = new Schema({
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
  sender: {
    type: String,
    enum: ['user', 'tutor'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  audioUrl: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  sourceMaterials: [{
    title: String,
    materialId: String
  }]
});

// Avatar Schema
const AvatarSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary'],
    required: true
  },
  style: {
    type: String,
    enum: ['professional', 'casual', 'friendly'],
    required: true
  },
  description: String,
  previewImageUrl: {
    type: String,
    required: true
  },
  modelUrl: {
    type: String,
    required: true
  },
  voicePreviewUrl: String,
  animations: [{
    name: String,
    url: String
  }],
  specialties: [String],
  personality: String
});

// Register models
mongoose.model('User', UserSchema);
mongoose.model('Course', CourseSchema);
mongoose.model('Session', SessionSchema);
mongoose.model('Message', MessageSchema);
mongoose.model('Avatar', AvatarSchema);

module.exports = {
  User: mongoose.model('User'),
  Course: mongoose.model('Course'),
  Session: mongoose.model('Session'),
  Message: mongoose.model('Message'),
  Avatar: mongoose.model('Avatar')
};
