import mongoose, { Document, Schema } from 'mongoose';

export interface IInteraction extends Document {
  userId: mongoose.Types.ObjectId;
  sessionId: string;
  type: 'question' | 'response' | 'feedback' | 'hint';
  content: string;
  context: {
    courseId?: mongoose.Types.ObjectId;
    lessonId?: mongoose.Types.ObjectId;
    exerciseId?: mongoose.Types.ObjectId;
  };
  timestamp: Date;
  metadata?: {
    sentiment?: string;
    topics?: string[];
    difficulty?: 'easy' | 'medium' | 'hard';
  };
}

const InteractionSchema: Schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['question', 'response', 'feedback', 'hint'],
    required: true,
  },
  content: {
    type: String,
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
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    sentiment: {
      type: String,
    },
    topics: {
      type: [String],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
    },
  },
});

// Create compound index for userId and timestamp
InteractionSchema.index({ userId: 1, timestamp: 1 });

export default mongoose.model<IInteraction>('Interaction', InteractionSchema);
