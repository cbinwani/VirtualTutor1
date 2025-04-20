import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

interface AvatarDetailProps {
  onUpdate: (id: string, data: any) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
}

const AvatarDetail: React.FC<AvatarDetailProps> = ({ onUpdate, onDelete }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      fetchAvatarDetails(id);
    }
  }, [id]);

  const fetchAvatarDetails = async (avatarId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/avatars/${avatarId}`);
      setAvatar(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching avatar details:', error);
      setError('Failed to load avatar details');
      setLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!id) return;
    
    try {
      await onDelete(id);
      navigate('/admin/avatars');
    } catch (error) {
      setError('Failed to delete avatar');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (loading) {
    return <div className="loading">Loading avatar details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!avatar) {
    return <div className="error-message">Avatar not found</div>;
  }

  return (
    <div className="avatar-detail">
      <div className="avatar-header">
        <div>
          <h2 className="avatar-title">{avatar.name}</h2>
        </div>
        <div className="avatar-header-actions">
          <Link to={`/admin/avatars/${id}/edit`} className="course-action-button edit-button">
            Edit Avatar
          </Link>
          <button onClick={handleDeleteClick} className="course-action-button delete-button">
            Delete Avatar
          </button>
        </div>
      </div>
      
      <div className="avatar-preview">
        <div className="avatar-preview-image">
          <img src={avatar.thumbnailUrl} alt={avatar.name} />
        </div>
        <div className="avatar-preview-details">
          <h3>Avatar Details</h3>
          
          <div className="avatar-detail-item">
            <div className="avatar-detail-label">Voice ID</div>
            <div className="avatar-detail-value">{avatar.voiceId}</div>
          </div>
          
          <div className="avatar-detail-item">
            <div className="avatar-detail-label">Model URL</div>
            <div className="avatar-detail-value">
              <a href={avatar.modelUrl} target="_blank" rel="noopener noreferrer">
                {avatar.modelUrl}
              </a>
            </div>
          </div>
          
          <div className="avatar-detail-item">
            <div className="avatar-detail-label">Status</div>
            <div className="avatar-detail-value">
              {avatar.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
          
          <div className="avatar-detail-item">
            <div className="avatar-detail-label">Created On</div>
            <div className="avatar-detail-value">
              {new Date(avatar.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
      
      <div className="avatar-characteristics-section">
        <h3>Characteristics</h3>
        
        <div className="avatar-detail-item">
          <div className="avatar-detail-label">Personality</div>
          <div className="avatar-characteristics-list">
            {avatar.characteristics?.personality?.map((trait: string) => (
              <span key={trait} className="characteristic-tag">{trait}</span>
            )) || <span>No personality traits specified</span>}
          </div>
        </div>
        
        <div className="avatar-detail-item">
          <div className="avatar-detail-label">Specialization</div>
          <div className="avatar-characteristics-list">
            {avatar.characteristics?.specialization?.map((spec: string) => (
              <span key={spec} className="characteristic-tag">{spec}</span>
            )) || <span>No specializations specified</span>}
          </div>
        </div>
        
        <div className="avatar-detail-item">
          <div className="avatar-detail-label">Teaching Style</div>
          <div className="avatar-characteristics-list">
            {avatar.characteristics?.teachingStyle?.map((style: string) => (
              <span key={style} className="characteristic-tag">{style}</span>
            )) || <span>No teaching styles specified</span>}
          </div>
        </div>
      </div>
      
      {avatar.modelUrl && (
        <div className="avatar-model-preview">
          <h3>3D Model Preview</h3>
          <div className="model-viewer">
            <p>3D model would be displayed here in production environment</p>
            <a href={avatar.modelUrl} target="_blank" rel="noopener noreferrer" className="view-button">
              View 3D Model
            </a>
          </div>
        </div>
      )}
      
      {showDeleteConfirm && (
        <div className="delete-confirmation">
          <div className="delete-confirmation-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this avatar? This action cannot be undone.</p>
            <div className="confirmation-actions">
              <button onClick={handleCancelDelete} className="cancel-button">
                Cancel
              </button>
              <button onClick={handleConfirmDelete} className="delete-button">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarDetail;
