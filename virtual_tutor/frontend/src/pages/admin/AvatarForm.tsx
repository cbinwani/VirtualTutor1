import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface AvatarFormProps {
  isEditing?: boolean;
  onSubmit: (id: string | undefined, data: any) => Promise<any>;
  onCancel: () => void;
}

const AvatarForm: React.FC<AvatarFormProps> = ({
  isEditing = false,
  onSubmit,
  onCancel
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    modelUrl: '',
    thumbnailUrl: '',
    voiceId: '',
    characteristics: {
      personality: [] as string[],
      specialization: [] as string[],
      teachingStyle: [] as string[]
    }
  });

  useEffect(() => {
    if (isEditing && id) {
      fetchAvatar(id);
    }
  }, [isEditing, id]);

  const fetchAvatar = async (avatarId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/avatars/${avatarId}`);
      const avatar = response.data.data;
      
      setFormData({
        name: avatar.name || '',
        modelUrl: avatar.modelUrl || '',
        thumbnailUrl: avatar.thumbnailUrl || '',
        voiceId: avatar.voiceId || '',
        characteristics: {
          personality: avatar.characteristics?.personality || [],
          specialization: avatar.characteristics?.specialization || [],
          teachingStyle: avatar.characteristics?.teachingStyle || []
        }
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching avatar:', error);
      setError('Failed to load avatar data');
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCharacteristicsChange = (category: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const values = value.split(',').map(item => item.trim()).filter(item => item);
    
    setFormData(prev => ({
      ...prev,
      characteristics: {
        ...prev.characteristics,
        [category]: values
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      await onSubmit(id, formData);
      
      setLoading(false);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save avatar');
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <div className="loading">Loading avatar data...</div>;
  }

  return (
    <div className="avatar-form">
      <h2 className="form-title">{isEditing ? 'Edit Avatar' : 'Create New Avatar'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Avatar Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="modelUrl">3D Model URL</label>
          <input
            type="url"
            id="modelUrl"
            name="modelUrl"
            value={formData.modelUrl}
            onChange={handleChange}
            required
          />
          <small>URL to the 3D model file (glTF/GLB format recommended)</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="thumbnailUrl">Thumbnail URL</label>
          <input
            type="url"
            id="thumbnailUrl"
            name="thumbnailUrl"
            value={formData.thumbnailUrl}
            onChange={handleChange}
            required
          />
          <small>URL to the avatar thumbnail image</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="voiceId">Voice ID</label>
          <input
            type="text"
            id="voiceId"
            name="voiceId"
            value={formData.voiceId}
            onChange={handleChange}
            required
          />
          <small>Voice identifier for speech synthesis</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="personality">Personality Traits</label>
          <input
            type="text"
            id="personality"
            name="personality"
            value={formData.characteristics.personality.join(', ')}
            onChange={(e) => handleCharacteristicsChange('personality', e as React.ChangeEvent<HTMLInputElement>)}
          />
          <small>Comma-separated list of personality traits (e.g., Friendly, Patient, Encouraging)</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="specialization">Specializations</label>
          <input
            type="text"
            id="specialization"
            name="specialization"
            value={formData.characteristics.specialization.join(', ')}
            onChange={(e) => handleCharacteristicsChange('specialization', e as React.ChangeEvent<HTMLInputElement>)}
          />
          <small>Comma-separated list of subject specializations (e.g., Mathematics, Science, History)</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="teachingStyle">Teaching Styles</label>
          <input
            type="text"
            id="teachingStyle"
            name="teachingStyle"
            value={formData.characteristics.teachingStyle.join(', ')}
            onChange={(e) => handleCharacteristicsChange('teachingStyle', e as React.ChangeEvent<HTMLInputElement>)}
          />
          <small>Comma-separated list of teaching styles (e.g., Interactive, Socratic, Visual)</small>
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Avatar' : 'Create Avatar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AvatarForm;
