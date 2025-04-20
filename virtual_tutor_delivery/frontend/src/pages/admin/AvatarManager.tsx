import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import './AvatarManager.css';

// Avatar components
import AvatarForm from './AvatarForm';
import AvatarList from './AvatarList';
import AvatarDetail from './AvatarDetail';

const AvatarManager: React.FC = () => {
  const [avatars, setAvatars] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAvatars();
  }, []);

  const fetchAvatars = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/avatars');
      setAvatars(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching avatars:', error);
      setError('Failed to load avatars');
      setLoading(false);
    }
  };

  const handleCreateAvatar = async (avatarData: any) => {
    try {
      const response = await axios.post('/api/avatars', avatarData);
      setAvatars([...avatars, response.data.data]);
      navigate('/admin/avatars');
      return response.data.data;
    } catch (error) {
      console.error('Error creating avatar:', error);
      throw error;
    }
  };

  const handleUpdateAvatar = async (id: string, avatarData: any) => {
    try {
      const response = await axios.put(`/api/avatars/${id}`, avatarData);
      setAvatars(avatars.map(avatar => 
        avatar._id === id ? response.data.data : avatar
      ));
      navigate(`/admin/avatars/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  };

  const handleDeleteAvatar = async (id: string) => {
    try {
      await axios.delete(`/api/avatars/${id}`);
      setAvatars(avatars.filter(avatar => avatar._id !== id));
      navigate('/admin/avatars');
    } catch (error) {
      console.error('Error deleting avatar:', error);
      throw error;
    }
  };

  return (
    <div className="avatar-manager">
      <Routes>
        <Route path="/" element={
          <>
            <div className="manager-header">
              <h2>Avatar Management</h2>
              <Link to="/admin/avatars/new" className="create-button">
                Create New Avatar
              </Link>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            {loading ? (
              <div className="loading">Loading avatars...</div>
            ) : (
              <AvatarList 
                avatars={avatars} 
                onRefresh={fetchAvatars} 
              />
            )}
          </>
        } />
        
        <Route path="/new" element={
          <AvatarForm 
            onSubmit={handleCreateAvatar} 
            onCancel={() => navigate('/admin/avatars')} 
          />
        } />
        
        <Route path="/:id" element={
          <AvatarDetail 
            onUpdate={handleUpdateAvatar}
            onDelete={handleDeleteAvatar}
          />
        } />
        
        <Route path="/:id/edit" element={
          <AvatarForm 
            isEditing={true}
            onSubmit={handleUpdateAvatar}
            onCancel={() => navigate('/admin/avatars')}
          />
        } />
      </Routes>
    </div>
  );
};

export default AvatarManager;
