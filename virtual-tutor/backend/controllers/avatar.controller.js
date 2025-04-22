// Avatar controller for Virtual Tutor application
const { Avatar } = require('../models');
const logger = require('../utils/logger');

// Get all available avatars
exports.getAvatars = async (req, res) => {
  try {
    // Get avatars
    const avatars = await Avatar.find();
    
    logger.info(`Retrieved ${avatars.length} avatars`);
    
    return res.status(200).json({
      avatars: avatars.map(avatar => ({
        avatarId: avatar._id,
        name: avatar.name,
        gender: avatar.gender,
        style: avatar.style,
        previewImageUrl: avatar.previewImageUrl,
        voicePreviewUrl: avatar.voicePreviewUrl,
        specialties: avatar.specialties
      }))
    });
  } catch (error) {
    logger.error('Error retrieving avatars:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve avatars'
      }
    });
  }
};

// Get avatar details
exports.getAvatarDetails = async (req, res) => {
  try {
    const { avatarId } = req.params;
    
    // Get avatar
    const avatar = await Avatar.findById(avatarId);
    if (!avatar) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'RESOURCE_NOT_FOUND',
          message: 'Avatar not found'
        }
      });
    }
    
    logger.info(`Retrieved details for avatar ${avatarId}`);
    
    return res.status(200).json({
      avatarId: avatar._id,
      name: avatar.name,
      gender: avatar.gender,
      style: avatar.style,
      description: avatar.description,
      previewImageUrl: avatar.previewImageUrl,
      modelUrl: avatar.modelUrl,
      voicePreviewUrl: avatar.voicePreviewUrl,
      animations: avatar.animations,
      specialties: avatar.specialties,
      personality: avatar.personality
    });
  } catch (error) {
    logger.error('Error retrieving avatar details:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to retrieve avatar details'
      }
    });
  }
};

module.exports = exports;
