import mongoose, { Document, Schema } from 'mongoose';

export interface IMemoryRecord extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'short-term' | 'long-term';
  category: 'preference' | 'performance' | 'interaction' | 'mistake' | 'strength';
  key: string;
  value: any;
  context: {
    courseId?: mongoose.Types.ObjectId;
    lessonId?: mongoose.Types.ObjectId;
    exerciseId?: mongoose.Types.ObjectId;
  };
  importance: number;
  expiresAt?: Date;
  lastAccessed?: Date;
  accessCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const MemoryRecordSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['short-term', 'long-term'],
      required: true,
    },
    category: {
      type: String,
      enum: ['preference', 'performance', 'interaction', 'mistake', 'strength'],
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    context: {
      courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
      },
      lessonId: {
        type: Schema.Types.ObjectId,
        ref: 'Lesson',
      },
      exerciseId: {
        type: Schema.Types.ObjectId,
        ref: 'Exercise',
      },
    },
    importance: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    expiresAt: {
      type: Date,
    },
    lastAccessed: {
      type: Date,
    },
    accessCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for userId and key
MemoryRecordSchema.index({ userId: 1, key: 1 });

export default mongoose.model<IMemoryRecord>('MemoryRecord', MemoryRecordSchema);
