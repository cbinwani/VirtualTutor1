import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserPreferences.css';

const UserPreferences = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [avatars, setAvatars] = useState([]);
  const [categories, setCategories] = useState([]);
  const [skillLevels] = useState(['Beginner', 'Intermediate', 'Advanced', 'Expert']);
  
  const [preferences, setPreferences] = useState({
    preferredAvatarId: '',
    preferredCategories: [],
    skillLevel: 'Beginner',
    learningGoals: '',
    studyReminders: false,
    reminderTime: '09:00',
    darkMode: false
  });

  // Fetch available avatars and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch avatars
        const avatarResponse = await fetch('/api/avatars', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!avatarResponse.ok) {
          throw new Error('Failed to fetch avatars');
        }
        
        const avatarData = await avatarResponse.json();
        setAvatars(avatarData.avatars);
        
        // Fetch categories
        const categoryResponse = await fetch('/api/courses/categories', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!categoryResponse.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const categoryData = await categoryResponse.json();
        setCategories(categoryData.categories);
        
        // Fetch user preferences if they exist
        const preferencesResponse = await fetch('/api/users/preferences', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (preferencesResponse.ok) {
          const preferencesData = await preferencesResponse.json();
          setPreferences(prev => ({
            ...prev,
            ...preferencesData
          }));
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load preferences data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setPreferences(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCategoryToggle = (category) => {
    setPreferences(prev => {
      const updatedCategories = [...prev.preferredCategories];
      
      if (updatedCategories.includes(category)) {
        // Remove category if already selected
        return {
          ...prev,
          preferredCategories: updatedCategories.filter(cat => cat !== category)
        };
      } else {
        // Add category if not selected
        return {
          ...prev,
          preferredCategories: [...updatedCategories, category]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setError('');
      
      const response = await fetch('/api/users/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(preferences)
      });
      
      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }
      
      // Store preferred avatar ID in localStorage for easy access
      localStorage.setItem('preferredAvatarId', preferences.preferredAvatarId);
      
      // Redirect to courses page
      navigate('/courses');
      
    } catch (error) {
      console.error('Error saving preferences:', error);
      setError('Failed to save preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="preferences-container">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading preferences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="preferences-container">
      <div className="preferences-card">
        <h1 className="preferences-title">Personalize Your Learning Experience</h1>
        <p className="preferences-subtitle">
          Tell us about your preferences to customize your learning journey
        </p>
        
        {error && (
          <div className="alert alert-danger">{error}</div>
        )}
        
        <form className="preferences-form" onSubmit={handleSubmit}>
          <div className="form-section">
            <h2 className="section-title">Choose Your Tutor</h2>
            <p className="section-description">
              Select a digital avatar that will be your personal tutor
            </p>
            
            <div className="avatar-grid">
              {avatars.map(avatar => (
                <div 
                  key={avatar.avatarId}
                  className={`avatar-option ${preferences.preferredAvatarId === avatar.avatarId ? 'selected' : ''}`}
                  onClick={() => setPreferences(prev => ({ ...prev, preferredAvatarId: avatar.avatarId }))}
                >
                  <div className="avatar-preview">
                    <img src={avatar.previewImageUrl} alt={avatar.name} />
                  </div>
                  <div className="avatar-name">{avatar.name}</div>
                  <div className="avatar-specialty">{avatar.specialty}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="form-section">
            <h2 className="section-title">Learning Preferences</h2>
            
            <div className="form-group">
              <label className="form-label">Skill Level</label>
              <div className="skill-level-options">
                {skillLevels.map(level => (
                  <div 
                    key={level}
                    className={`skill-level-option ${preferences.skillLevel === level ? 'selected' : ''}`}
                    onClick={() => setPreferences(prev => ({ ...prev, skillLevel: level }))}
                  >
                    {level}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Preferred Subject Categories</label>
              <div className="category-options">
                {categories.map(category => (
                  <div 
                    key={category}
                    className={`category-option ${preferences.preferredCategories.includes(category) ? 'selected' : ''}`}
                    onClick={() => handleCategoryToggle(category)}
                  >
                    {category}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="learningGoals" className="form-label">Learning Goals</label>
              <textarea
                id="learningGoals"
                name="learningGoals"
                className="form-control"
                value={preferences.learningGoals}
                onChange={handleChange}
                placeholder="What do you hope to achieve with Virtual Tutor? (e.g., Improve grades, learn new skills, prepare for exams)"
                rows={3}
              ></textarea>
            </div>
          </div>
          
          <div className="form-section">
            <h2 className="section-title">App Settings</h2>
            
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="studyReminders"
                name="studyReminders"
                checked={preferences.studyReminders}
                onChange={handleChange}
              />
              <label htmlFor="studyReminders">Enable Study Reminders</label>
            </div>
            
            {preferences.studyReminders && (
              <div className="form-group">
                <label htmlFor="reminderTime" className="form-label">Preferred Reminder Time</label>
                <input
                  type="time"
                  id="reminderTime"
                  name="reminderTime"
                  className="form-control"
                  value={preferences.reminderTime}
                  onChange={handleChange}
                />
              </div>
            )}
            
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="darkMode"
                name="darkMode"
                checked={preferences.darkMode}
                onChange={handleChange}
              />
              <label htmlFor="darkMode">Dark Mode</label>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="save-button"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserPreferences;
