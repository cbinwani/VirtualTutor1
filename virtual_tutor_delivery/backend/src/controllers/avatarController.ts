import { Request, Response } from 'express';
import Avatar from '../models/Avatar';

// Get all avatars
export const getAllAvatars = async (req: Request, res: Response) => {
  try {
    const avatars = await Avatar.find({ isActive: true });

    res.status(200).json({
      success: true,
      count: avatars.length,
      data: avatars,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching avatars',
      error: error.message,
    });
  }
};

// Get avatar by ID
export const getAvatarById = async (req: Request, res: Response) => {
  try {
    const avatar = await Avatar.findById(req.params.id);

    if (!avatar) {
      return res.status(404).json({
        success: false,
        message: 'Avatar not found',
      });
    }

    res.status(200).json({
      success: true,
      data: avatar,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching avatar',
      error: error.message,
    });
  }
};

// Create new avatar
export const createAvatar = async (req: Request, res: Response) => {
  try {
    const { name, modelUrl, thumbnailUrl, voiceId, characteristics } = req.body;

    const avatar = new Avatar({
      name,
      modelUrl,
      thumbnailUrl,
      voiceId,
      characteristics,
    });

    await avatar.save();

    res.status(201).json({
      success: true,
      message: 'Avatar created successfully',
      data: avatar,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating avatar',
      error: error.message,
    });
  }
};

// Update avatar
export const updateAvatar = async (req: Request, res: Response) => {
  try {
    const avatar = await Avatar.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!avatar) {
      return res.status(404).json({
        success: false,
        message: 'Avatar not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Avatar updated successfully',
      data: avatar,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating avatar',
      error: error.message,
    });
  }
};

// Delete avatar
export const deleteAvatar = async (req: Request, res: Response) => {
  try {
    const avatar = await Avatar.findById(req.params.id);

    if (!avatar) {
      return res.status(404).json({
        success: false,
        message: 'Avatar not found',
      });
    }

    // Instead of deleting, mark as inactive
    avatar.isActive = false;
    await avatar.save();

    res.status(200).json({
      success: true,
      message: 'Avatar deactivated successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deactivating avatar',
      error: error.message,
    });
  }
};
