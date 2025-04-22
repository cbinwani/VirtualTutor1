import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [learningProgress, setLearningProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  
  // Form state for profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch user data and enrolled courses
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user profile
        const userResponse = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user profile');
        }
        
        const userData = await userResponse.json();
        setUser(userData);
        
        // Initialize form data with user data
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Fetch enrolled courses
        const coursesResponse = await fetch('/api/users/enrolled-courses', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setEnrolledCourses(coursesData.courses || []);
        }
        
        // Fetch learning progress
        const progressResponse = await fetch('/api/users/learning-progress', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          setLearningProgress(progressData);
        }
        
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user profile. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setSaveSuccess(false);
    
    // Reset form errors when toggling edit mode
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Only validate fields that are being updated
    if (formData.firstName.trim() === '') {
      errors.firstName = 'First name is required';
    }
    
    if (formData.lastName.trim() === '') {
      errors.lastName = 'Last name is required';
    }
    
    if (formData.email.trim() === '') {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (formData.phone.trim() === '') {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s+/g, ''))) {
      errors.phone = 'Phone number is invalid';
    }
    
    // Password validation only if user is trying to change password
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        errors.currentPassword = 'Current password is required to set a new password';
      }
      
      if (formData.newPassword.length < 8) {
        errors.newPassword = 'New password must be at least 8 characters';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      // Prepare data for update
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone
      };
      
      // Add password data if user is changing password
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }
      
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update profile');
      }
      
      // Update user state with new data
      const updatedUser = await response.json();
      setUser(updatedUser);
      
      // Show success message and exit edit mode
      setSaveSuccess(true);
      setIsEditing(false);
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setFormErrors(prev => ({
        ...prev,
        general: error.message || 'Failed to update profile. Please try again.'
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        const response = await fetch('/api/users/profile', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete account');
        }
        
        // Clear local storage and redirect to home page
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        localStorage.removeItem('preferredAvatarId');
        
        navigate('/');
        
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete account. Please try again later.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabChange('profile')}
          >
            Personal Info
          </button>
          <button 
            className={`tab-button ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => handleTabChange('courses')}
          >
            My Courses
          </button>
          <button 
            className={`tab-button ${activeTab === 'progress' ? 'active' : ''}`}
            onClick={() => handleTabChange('progress')}
          >
            Learning Progress
          </button>
          <button 
            className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => handleTabChange('preferences')}
          >
            Preferences
          </button>
        </div>
      </div>
      
      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="section-header">
              <h2>Personal Information</h2>
              {!isEditing ? (
                <button className="edit-button" onClick={handleEditToggle}>
                  Edit Profile
                </button>
              ) : (
                <button className="cancel-button" onClick={handleEditToggle}>
                  Cancel
                </button>
              )}
            </div>
            
            {saveSuccess && (
              <div className="alert alert-success">
                Profile updated successfully!
              </div>
            )}
            
            {formErrors.general && (
              <div className="alert alert-danger">
                {formErrors.general}
              </div>
            )}
            
            {isEditing ? (
              <form className="profile-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={formErrors.firstName ? 'is-invalid' : ''}
                    />
                    {formErrors.firstName && (
                      <div className="invalid-feedback">{formErrors.firstName}</div>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={formErrors.lastName ? 'is-invalid' : ''}
                    />
                    {formErrors.lastName && (
                      <div className="invalid-feedback">{formErrors.lastName}</div>
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={formErrors.email ? 'is-invalid' : ''}
                  />
                  {formErrors.email && (
                    <div className="invalid-feedback">{formErrors.email}</div>
                  )}
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={formErrors.phone ? 'is-invalid' : ''}
                  />
                  {formErrors.phone && (
                    <div className="invalid-feedback">{formErrors.phone}</div>
                  )}
                </div>
                
                <div className="password-section">
                  <h3>Change Password</h3>
                  <p className="password-hint">Leave blank if you don't want to change your password</p>
                  
                  <div className="form-group">
                    <label htmlFor="currentPassword">Current Password</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className={formErrors.currentPassword ? 'is-invalid' : ''}
                    />
                    {formErrors.currentPassword && (
                      <div className="invalid-feedback">{formErrors.currentPassword}</div>
                    )}
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="newPassword">New Password</label>
                      <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className={formErrors.newPassword ? 'is-invalid' : ''}
                      />
                      {formErrors.newPassword && (
                        <div className="invalid-feedback">{formErrors.newPassword}</div>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirm New Password</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={formErrors.confirmPassword ? 'is-invalid' : ''}
                      />
                      {formErrors.confirmPassword && (
                        <div className="invalid-feedback">{formErrors.confirmPassword}</div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="save-button"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-row">
                  <div className="info-label">Name</div>
                  <div className="info-value">{user.firstName} {user.lastName}</div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Email</div>
                  <div className="info-value">{user.email}</div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Phone</div>
                  <div className="info-value">{user.phone}</div>
                </div>
                
                <div className="info-row">
                  <div className="info-label">Member Since</div>
                  <div className="info-value">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="danger-zone">
                  <h3>Danger Zone</h3>
                  <button 
                    className="delete-account-button"
                    onClick={handleDeleteAccount}
                  >
                    Delete Account
                  </button>
                  <p className="danger-note">
                    This action cannot be undone. All your data will be permanently deleted.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'courses' && (
          <div className="profile-section">
            <h2>My Enrolled Courses</h2>
            
            {enrolledCourses.length === 0 ? (
              <div className="no-courses">
                <p>You haven't enrolled in any courses yet.</p>
                <button 
                  className="browse-courses-button"
                  onClick={() => navigate('/courses')}
                >
                  Browse Courses
                </button>
              </div>
            ) : (
              <div className="enrolled-courses">
                {enrolledCourses.map(course => (
                  <div key={course.courseId} className="enrolled-course-card">
                    <div className="course-info">
                      <h3>{course.title}</h3>
                      <div className="course-meta">
                        <span className="course-category">{course.category}</span>
                        <span className="course-level">{course.level}</span>
                      </div>
                      <div className="course-progress">
                        <div className="progress-bar-container">
                          <div 
                            className="progress-bar" 
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{course.progress}% Complete</span>
                      </div>
                    </div>
                    <div className="course-actions">
                      <button 
                        className="continue-button"
                        onClick={() => navigate(`/courses/${course.courseId}`)}
                      >
                        Continue Learning
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'progress' && (
          <div className="profile-section">
            <h2>Learning Progress</h2>
            
            {!learningProgress ? (
              <div className="no-progress">
                <p>No learning progress data available yet. Start learning to see your progress!</p>
              </div>
            ) : (
              <div className="learning-progress">
                <div className="progress-stats">
                  <div className="stat-card">
                    <div className="stat-value">{learningProgress.totalSessionsCompleted}</div>
                    <div className="stat-label">Sessions Completed</div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-value">{learningProgress.totalHoursSpent}</div>
                    <div className="stat-label">Hours Spent Learning</div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-value">{learningProgress.coursesCompleted}</div>
                    <div className="stat-label">Courses Completed</div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-value">{learningProgress.averageScore}%</div>
                    <div className="stat-label">Average Score</div>
                  </div>
                </div>
                
                {learningProgress.recentActivity && learningProgress.recentActivity.length > 0 && (
                  <div className="recent-activity">
                    <h3>Recent Activity</h3>
                    <div className="activity-list">
                      {learningProgress.recentActivity.map((activity, index) => (
                        <div key={index} className="activity-item">
                          <div className="activity-icon"></div>
                          <div className="activity-details">
                            <div className="activity-title">{activity.title}</div>
                            <div className="activity-meta">
                              <span className="activity-course">{activity.courseName}</span>
                              <span className="activity-time">
                                {new Date(activity.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {learningProgress.improvementAreas && learningProgress.improvementAreas.length > 0 && (
                  <div className="improvement-areas">
                    <h3>Areas for Improvement</h3>
                    <ul className="improvement-list">
                      {learningProgress.improvementAreas.map((area, index) => (
                        <li key={index} className="improvement-item">{area}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'preferences' && (
          <div className="profile-section">
            <h2>Learning Preferences</h2>
            <p className="preferences-description">
              Manage your learning preferences and application settings
            </p>
            
            <button 
              className="edit-preferences-button"
              onClick={() => navigate('/preferences')}
            >
              Edit Preferences
            </button>
            
            {user.preferences && (
              <div className="current-preferences">
                <div className="preferences-group">
                  <h3>Preferred Avatar</h3>
                  <div className="avatar-preference">
                    {user.preferences.preferredAvatarName && (
                      <>
                        <div className="avatar-image">
                          <img src={user.preferences.preferredAvatarImage} alt={user.preferences.preferredAvatarName} />
                        </div>
                        <div className="avatar-name">{user.preferences.preferredAvatarName}</div>
                      </>
                    )}
                    {!user.preferences.preferredAvatarName && (
                      <p>No preferred avatar selected</p>
                    )}
                  </div>
                </div>
                
                <div className="preferences-group">
                  <h3>Skill Level</h3>
                  <p>{user.preferences.skillLevel || 'Not specified'}</p>
                </div>
                
                <div className="preferences-group">
                  <h3>Preferred Categories</h3>
                  {user.preferences.preferredCategories && user.preferences.preferredCategories.length > 0 ? (
                    <div className="category-tags">
                      {user.preferences.preferredCategories.map((category, index) => (
                        <span key={index} className="category-tag">{category}</span>
                      ))}
                    </div>
                  ) : (
                    <p>No preferred categories selected</p>
                  )}
                </div>
                
                <div className="preferences-group">
                  <h3>Learning Goals</h3>
                  <p>{user.preferences.learningGoals || 'No learning goals specified'}</p>
                </div>
                
                <div className="preferences-group">
                  <h3>App Settings</h3>
                  <div className="settings-list">
                    <div className="setting-item">
                      <span className="setting-name">Study Reminders</span>
                      <span className="setting-value">
                        {user.preferences.studyReminders ? 'Enabled' : 'Disabled'}
                        {user.preferences.studyReminders && user.preferences.reminderTime && (
                          <> at {user.preferences.reminderTime}</>
                        )}
                      </span>
                    </div>
                    <div className="setting-item">
                      <span className="setting-name">Dark Mode</span>
                      <span className="setting-value">
                        {user.preferences.darkMode ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
