import React from 'react';
import { Link } from 'react-router-dom';

interface AvatarListProps {
  avatars: any[];
  onRefresh: () => void;
}

const AvatarList: React.FC<AvatarListProps> = ({ avatars, onRefresh }) => {
  if (avatars.length === 0) {
    return (
      <div className="empty-state">
        <p>No avatars available. Create your first avatar to get started.</p>
        <Link to="/admin/avatars/new" className="create-button">
          Create New Avatar
        </Link>
      </div>
    );
  }

  return (
    <div className="avatar-list">
      {avatars.map(avatar => (
        <div key={avatar._id} className="avatar-card">
          <div className="avatar-image">
            <img src={avatar.thumbnailUrl} alt={avatar.name} />
          </div>
          <div className="avatar-info">
            <h3>{avatar.name}</h3>
            <p className="avatar-voice">Voice: {avatar.voiceId}</p>
            <p className="avatar-characteristics">
              {avatar.characteristics?.specialization?.join(', ') || 'General Tutor'}
            </p>
            <div className="avatar-actions">
              <Link to={`/admin/avatars/${avatar._id}`} className="course-action-button view-button">
                View
              </Link>
              <Link to={`/admin/avatars/${avatar._id}/edit`} className="course-action-button edit-button">
                Edit
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AvatarList;
