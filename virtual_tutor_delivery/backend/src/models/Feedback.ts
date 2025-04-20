import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  userId: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  lessonId?: mongoose.Types.ObjectId;
  exerciseId?: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  category: 'content' | 'avatar' | 'interface' | 'technical' | 'general';
  status: 'submitted' | 'reviewed' | 'addressed';
  adminResponse?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
    category: {
      type: String,
      enum: ['content', 'avatar', 'interface', 'technical', 'general'],
      required: true,
    },
    status: {
      type: String,
      enum: ['submitted', 'reviewed', 'addressed'],
      default: 'submitted',
      required: true,
    },
    adminResponse: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create index for userId
FeedbackSchema.index({ userId: 1 });

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);
