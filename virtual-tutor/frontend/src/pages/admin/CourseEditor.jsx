import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CourseEditor.css';

const CourseEditor = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const isEditMode = courseId !== 'new';
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    status: 'draft',
    topics: []
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState([]);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  
  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/categories', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
    
    // Fetch course data if in edit mode
    if (isEditMode) {
      fetchCourseData();
    }
  }, [courseId, isEditMode]);
  
  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch course data');
      }
      
      const courseData = await response.json();
      
      // Fetch topics
      const topicsResponse = await fetch(`/api/admin/courses/${courseId}/topics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!topicsResponse.ok) {
        throw new Error('Failed to fetch course topics');
      }
      
      const topicsData = await topicsResponse.json();
      
      setFormData({
        title: courseData.title || '',
        description: courseData.description || '',
        category: courseData.category || '',
        level: courseData.level || 'beginner',
        status: courseData.status || 'draft',
        topics: topicsData.topics || []
      });
      
    } catch (error) {
      console.error('Error fetching course data:', error);
      setError('Failed to load course data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
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
  
  const handleTopicChange = (index, value) => {
    const updatedTopics = [...formData.topics];
    updatedTopics[index].title = value;
    
    setFormData(prev => ({
      ...prev,
      topics: updatedTopics
    }));
  };
  
  const handleAddTopic = () => {
    if (!newTopicTitle.trim()) {
      return;
    }
    
    const newTopic = {
      topicId: `temp-${Date.now()}`, // Temporary ID for new topics
      title: newTopicTitle,
      order: formData.topics.length
    };
    
    setFormData(prev => ({
      ...prev,
      topics: [...prev.topics, newTopic]
    }));
    
    setNewTopicTitle('');
  };
  
  const handleRemoveTopic = (index) => {
    const updatedTopics = [...formData.topics];
    updatedTopics.splice(index, 1);
    
    // Update order of remaining topics
    updatedTopics.forEach((topic, idx) => {
      topic.order = idx;
    });
    
    setFormData(prev => ({
      ...prev,
      topics: updatedTopics
    }));
  };
  
  const handleMoveTopic = (index, direction) => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === formData.topics.length - 1)
    ) {
      return;
    }
    
    const updatedTopics = [...formData.topics];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap topics
    [updatedTopics[index], updatedTopics[newIndex]] = [updatedTopics[newIndex], updatedTopics[index]];
    
    // Update order
    updatedTopics.forEach((topic, idx) => {
      topic.order = idx;
    });
    
    setFormData(prev => ({
      ...prev,
      topics: updatedTopics
    }));
  };
  
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    
    if (formData.topics.length === 0) {
      errors.topics = 'At least one topic is required';
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
    
    try {
      const courseData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        level: formData.level,
        status: formData.status
      };
      
      let courseResponse;
      
      if (isEditMode) {
        // Update existing course
        courseResponse = await fetch(`/api/admin/courses/${courseId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(courseData)
        });
      } else {
        // Create new course
        courseResponse = await fetch('/api/admin/courses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(courseData)
        });
      }
      
      if (!courseResponse.ok) {
        throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} course`);
      }
      
      const courseResult = await courseResponse.json();
      const savedCourseId = isEditMode ? courseId : courseResult.course.courseId;
      
      // Save topics
      const topicsData = {
        topics: formData.topics.map((topic, index) => ({
          ...topic,
          order: index
        }))
      };
      
      const topicsResponse = await fetch(`/api/admin/courses/${savedCourseId}/topics`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(topicsData)
      });
      
      if (!topicsResponse.ok) {
        throw new Error('Failed to save course topics');
      }
      
      // Navigate to course materials page
      navigate(`/admin/courses/${savedCourseId}/materials`);
      
    } catch (error) {
      console.error('Error saving course:', error);
      setError(`Failed to ${isEditMode ? 'update' : 'create'} course. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="course-editor">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading course data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="course-editor">
      <div className="editor-header">
        <h1>{isEditMode ? 'Edit Course' : 'Create New Course'}</h1>
        <button 
          className="back-button"
          onClick={() => navigate('/admin/courses')}
        >
          Back to Courses
        </button>
      </div>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      <form className="course-form" onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Course Information</h2>
          
          <div className="form-group">
            <label htmlFor="title">Course Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={formErrors.title ? 'is-invalid' : ''}
            />
            {formErrors.title && (
              <div className="invalid-feedback">{formErrors.title}</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Course Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={5}
              className={formErrors.description ? 'is-invalid' : ''}
            ></textarea>
            {formErrors.description && (
              <div className="invalid-feedback">{formErrors.description}</div>
            )}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={formErrors.category ? 'is-invalid' : ''}
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {formErrors.category && (
                <div className="invalid-feedback">{formErrors.category}</div>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="level">Difficulty Level</label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleInputChange}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="form-section">
          <h2>Course Topics</h2>
          
          {formErrors.topics && (
            <div className="invalid-feedback topics-error">{formErrors.topics}</div>
          )}
          
          <div className="topics-list">
            {formData.topics.map((topic, index) => (
              <div key={topic.topicId} className="topic-item">
                <div className="topic-order">{index + 1}</div>
                <input
                  type="text"
                  value={topic.title}
                  onChange={(e) => handleTopicChange(index, e.target.value)}
                  placeholder="Topic title"
                />
                <div className="topic-actions">
                  <button 
                    type="button" 
                    className="move-up-button"
                    onClick={() => handleMoveTopic(index, 'up')}
                    disabled={index === 0}
                  >
                    ↑
                  </button>
                  <button 
                    type="button" 
                    className="move-down-button"
                    onClick={() => handleMoveTopic(index, 'down')}
                    disabled={index === formData.topics.length - 1}
                  >
                    ↓
                  </button>
                  <button 
                    type="button" 
                    className="remove-topic-button"
                    onClick={() => handleRemoveTopic(index)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="add-topic-form">
            <input
              type="text"
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              placeholder="New topic title"
            />
            <button 
              type="button" 
              className="add-topic-button"
              onClick={handleAddTopic}
            >
              Add Topic
            </button>
          </div>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate('/admin/courses')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="save-button"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : isEditMode ? 'Update Course' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseEditor;
