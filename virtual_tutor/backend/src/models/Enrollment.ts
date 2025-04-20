import mongoose, { Document, Schema } from 'mongoose';

export interface IEnrollment extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  enrollmentDate: Date;
  currentModule: mongoose.Types.ObjectId;
  currentLesson: mongoose.Types.ObjectId;
  progress: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  lastAccessDate: Date;
  completionDate?: Date;
  certificate?: {
    issued: boolean;
    issuedDate?: Date;
    certificateUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema: Schema = new Schema(
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
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    currentModule: {
      type: Schema.Types.ObjectId,
      ref: 'Module',
      required: true,
    },
    currentLesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    progress: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    lastAccessDate: {
      type: Date,
      default: Date.now,
    },
    completionDate: {
      type: Date,
    },
    certificate: {
      issued: {
        type: Boolean,
        default: false,
      },
      issuedDate: {
        type: Date,
      },
      certificateUrl: {
        type: String,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index for userId and courseId
EnrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
