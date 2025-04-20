import mongoose, { Document, Schema } from 'mongoose';

export interface ILesson extends Document {
  moduleId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  content: string;
  order: number;
  estimatedDuration: number;
  resources: {
    type: 'video' | 'document' | 'link' | 'image';
    url: string;
    title: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema: Schema = new Schema(
  {
    moduleId: {
      type: Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    order: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedDuration: {
      type: Number,
      required: true,
      min: 0,
    },
    resources: [
      {
        type: {
          type: String,
          enum: ['video', 'document', 'link', 'image'],
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
        title: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create compound index for moduleId and order
LessonSchema.index({ moduleId: 1, order: 1 }, { unique: true });

export default mongoose.model<ILesson>('Lesson', LessonSchema);
