import mongoose, { Document, Schema } from 'mongoose';

export interface IProgress extends Document {
  userId: mongoose.Types.ObjectId;
  enrollmentId: mongoose.Types.ObjectId;
  lessonId: mongoose.Types.ObjectId;
  exerciseId?: mongoose.Types.ObjectId;
  status: 'not-started' | 'in-progress' | 'completed';
  score?: number;
  timeSpent: number;
  completedAt?: Date;
  responses?: {
    questionIndex: number;
    userAnswer: string | string[];
    isCorrect: boolean;
    timeTaken: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ProgressSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: 'Exercise',
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started',
      required: true,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    timeSpent: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    completedAt: {
      type: Date,
    },
    responses: [
      {
        questionIndex: {
          type: Number,
          required: true,
        },
        userAnswer: {
          type: Schema.Types.Mixed,
          required: true,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
        timeTaken: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create compound indexes
ProgressSchema.index({ userId: 1, lessonId: 1 });
ProgressSchema.index({ enrollmentId: 1, lessonId: 1 });

export default mongoose.model<IProgress>('Progress', ProgressSchema);
