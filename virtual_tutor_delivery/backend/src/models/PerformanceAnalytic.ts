import mongoose, { Document, Schema } from 'mongoose';

export interface IPerformanceAnalytic extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'course';
  date: Date;
  metrics: {
    timeSpent: number;
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
    referenceId: mongoose.Types.ObjectId;
    reason: string;
    priority: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const PerformanceAnalyticSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    timeframe: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'course'],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    metrics: {
      timeSpent: {
        type: Number,
        required: true,
        min: 0,
      },
      lessonsCompleted: {
        type: Number,
        required: true,
        min: 0,
      },
      exercisesCompleted: {
        type: Number,
        required: true,
        min: 0,
      },
      averageScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      strengths: [
        {
          topic: {
            type: String,
            required: true,
          },
          score: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
          },
        },
      ],
      weaknesses: [
        {
          topic: {
            type: String,
            required: true,
          },
          score: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
          },
        },
      ],
      improvement: [
        {
          topic: {
            type: String,
            required: true,
          },
          previousScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
          },
          currentScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
          },
          delta: {
            type: Number,
            required: true,
          },
        },
      ],
    },
    recommendations: [
      {
        type: {
          type: String,
          enum: ['lesson', 'exercise', 'resource'],
          required: true,
        },
        referenceId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        reason: {
          type: String,
          required: true,
        },
        priority: {
          type: Number,
          required: true,
          min: 1,
          max: 10,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create compound index for userId, courseId, and date
PerformanceAnalyticSchema.index({ userId: 1, courseId: 1, date: 1 });

export default mongoose.model<IPerformanceAnalytic>('PerformanceAnalytic', PerformanceAnalyticSchema);
