import mongoose, { Document, Schema } from 'mongoose';

export interface IAvatar extends Document {
  name: string;
  modelUrl: string;
  thumbnailUrl: string;
  voiceId: string;
  characteristics: {
    gender?: string;
    accent?: string;
    personality?: string;
    specialization?: string[];
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AvatarSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    modelUrl: {
      type: String,
      required: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    voiceId: {
      type: String,
      required: true,
    },
    characteristics: {
      gender: {
        type: String,
      },
      accent: {
        type: String,
      },
      personality: {
        type: String,
      },
      specialization: {
        type: [String],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IAvatar>('Avatar', AvatarSchema);
