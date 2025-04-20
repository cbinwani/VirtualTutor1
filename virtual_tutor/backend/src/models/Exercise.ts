import mongoose, { Document, Schema } from 'mongoose';

export interface IExercise extends Document {
  lessonId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: 'quiz' | 'assignment' | 'practice' | 'discussion';
  difficulty: 'easy' | 'medium' | 'hard';
  questions: {
    questionText: string;
    questionType: 'multiple-choice' | 'true-false' | 'fill-blank' | 'open-ended';
    options?: string[];
    correctAnswer?: string | string[];
    explanation?: string;
    points: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ExerciseSchema: Schema = new Schema(
  {
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
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
    type: {
      type: String,
      enum: ['quiz', 'assignment', 'practice', 'discussion'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    questions: [
      {
        questionText: {
          type: String,
          required: true,
        },
        questionType: {
          type: String,
          enum: ['multiple-choice', 'true-false', 'fill-blank', 'open-ended'],
          required: true,
        },
        options: {
          type: [String],
        },
        correctAnswer: {
          type: Schema.Types.Mixed,
        },
        explanation: {
          type: String,
        },
        points: {
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

export default mongoose.model<IExercise>('Exercise', ExerciseSchema);
