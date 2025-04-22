import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './CourseMaterials.css';

const CourseMaterials = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state for adding/editing materials
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' or 'edit'
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'document',
    content: '',
    url: '',
    file: null,
    description: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch course details
      const courseResponse = await fetch(`/api/admin/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!courseResponse.ok) {
        throw new Error('Failed to fetch course details');
      }
      
      const courseData = await courseResponse.json();
      setCourse(courseData);
      
      // Fetch course topics
      const topicsResponse = await fetch(`/api/admin/courses/${courseId}/topics`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!topicsResponse.ok) {
        throw new Error('Failed to fetch course topics');
      }
      
      const topicsData = await topicsResponse.json();
      setTopics(topicsData.topics || []);
      
      // Set first topic as selected if available
      if (topicsData.topics && topicsData.topics.length > 0) {
        setSelectedTopic(topicsData.topics[0].topicId);
      }
      
      // Fetch course materials
      const materialsResponse = await fetch(`/api/admin/courses/${courseId}/materials`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!materialsResponse.ok) {
        throw new Error('Failed to fetch course materials');
      }
      
      const materialsData = await materialsResponse.json();
      setMaterials(materialsData.materials || []);
      
    } catch (error) {
      console.error('Error fetching course data:', error);
      setError('Failed to load course data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopicSelect = (topicId) => {
    setSelectedTopic(topicId);
  };

  const getTopicById = (topicId) => {
    return topics.find(topic => topic.topicId === topicId) || null;
  };

  const getTopicMaterials = () => {
    if (!selectedTopic) return [];
    return materials.filter(material => material.topicId === selectedTopic);
  };

  const handleAddMaterial = () => {
    setFormMode('add');
    setEditingMaterialId(null);
    setFormData({
      title: '',
      type: 'document',
      content: '',
      url: '',
      file: null,
      description: ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleEditMaterial = (material) => {
    setFormMode('edit');
    setEditingMaterialId(material.materialId);
    setFormData({
      title: material.title || '',
      type: material.type || 'document',
      content: material.content || '',
      url: material.url || '',
      file: null,
      description: material.description || ''
    });
    setFormErrors({});
    setIsFormOpen(true);
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/materials/${materialId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete material');
      }
      
      // Update materials list
      setMaterials(prevMaterials => 
        prevMaterials.filter(material => material.materialId !== materialId)
      );
      
    } catch (error) {
      console.error('Error deleting material:', error);
      alert('Failed to delete material. Please try again.');
    }
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'file' && files && files.length > 0) {
      setFormData(prev => ({
        ...prev,
        file: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
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
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (formData.type === 'document' && !formData.content.trim()) {
      errors.content = 'Content is required for document type';
    }
    
    if (formData.type === 'link' && !formData.url.trim()) {
      errors.url = 'URL is required for link type';
    }
    
    if (formData.type === 'file' && !formData.file && formMode === 'add') {
      errors.file = 'File is required for file type';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Create FormData object for file upload
      const formDataObj = new FormData();
      formDataObj.append('title', formData.title);
      formDataObj.append('type', formData.type);
      formDataObj.append('description', formData.description);
      formDataObj.append('topicId', selectedTopic);
      
      if (formData.type === 'document') {
        formDataObj.append('content', formData.content);
      } else if (formData.type === 'link') {
        formDataObj.append('url', formData.url);
      } else if (formData.type === 'file' && formData.file) {
        formDataObj.append('file', formData.file);
      }
      
      let response;
      
      if (formMode === 'add') {
        // Create new material
        response = await fetch(`/api/admin/courses/${courseId}/materials`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formDataObj
        });
      } else {
        // Update existing material
        response = await fetch(`/api/admin/materials/${editingMaterialId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formDataObj
        });
      }
      
      if (!response.ok) {
        throw new Error(`Failed to ${formMode === 'add' ? 'add' : 'update'} material`);
      }
      
      const responseData = await response.json();
      
      // Update materials list
      if (formMode === 'add') {
        setMaterials(prev => [...prev, responseData.material]);
      } else {
        setMaterials(prev => 
          prev.map(material => 
            material.materialId === editingMaterialId ? responseData.material : material
          )
        );
      }
      
      // Close form
      setIsFormOpen(false);
      
    } catch (error) {
      console.error('Error saving material:', error);
      setFormErrors(prev => ({
        ...prev,
        general: `Failed to ${formMode === 'add' ? 'add' : 'update'} material. Please try again.`
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
  };

  if (isLoading) {
    return (
      <div className="course-materials">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading course materials...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-materials">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchCourseData} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="course-materials">
      <div className="materials-header">
        <div className="header-title">
          <h1>Course Materials</h1>
          <h2>{course?.title}</h2>
        </div>
        <div className="header-actions">
          <button 
            className="back-button"
            onClick={() => navigate('/admin/courses')}
          >
            Back to Courses
          </button>
        </div>
      </div>
      
      <div className="materials-content">
        <div className="topics-sidebar">
          <h3>Topics</h3>
          {topics.length === 0 ? (
            <div className="no-topics">
              <p>No topics available for this course.</p>
              <button 
                className="add-topic-button"
                onClick={() => navigate(`/admin/courses/${courseId}/edit`)}
              >
                Add Topics
              </button>
            </div>
          ) : (
            <ul className="topics-list">
              {topics.map(topic => (
                <li 
                  key={topic.topicId}
                  className={`topic-item ${selectedTopic === topic.topicId ? 'selected' : ''}`}
                  onClick={() => handleTopicSelect(topic.topicId)}
                >
                  <div className="topic-title">{topic.title}</div>
                  <div className="topic-material-count">
                    {materials.filter(m => m.topicId === topic.topicId).length} materials
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="materials-main">
          {selectedTopic ? (
            <>
              <div className="materials-section-header">
                <h3>{getTopicById(selectedTopic)?.title} Materials</h3>
                <button 
                  className="add-material-button"
                  onClick={handleAddMaterial}
                >
                  Add Material
                </button>
              </div>
              
              {getTopicMaterials().length === 0 ? (
                <div className="no-materials">
                  <p>No materials available for this topic.</p>
                  <p>Click the "Add Material" button to create your first material.</p>
                </div>
              ) : (
                <div className="materials-list">
                  {getTopicMaterials().map(material => (
                    <div key={material.materialId} className="material-card">
                      <div className={`material-icon ${material.type}-icon`}></div>
                      <div className="material-content">
                        <div className="material-title">{material.title}</div>
                        <div className="material-type">{material.type}</div>
                        {material.description && (
                          <div className="material-description">{material.description}</div>
                        )}
                      </div>
                      <div className="material-actions">
                        <button 
                          className="edit-button"
                          onClick={() => handleEditMaterial(material)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-button"
                          onClick={() => handleDeleteMaterial(material.materialId)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="no-topic-selected">
              <p>Select a topic from the sidebar to view and manage its materials.</p>
            </div>
          )}
        </div>
      </div>
      
      {isFormOpen && (
        <div className="material-form-overlay">
          <div className="material-form-container">
            <div className="form-header">
              <h2>{formMode === 'add' ? 'Add New Material' : 'Edit Material'}</h2>
              <button 
                className="close-button"
                onClick={handleFormCancel}
              >
                ×
              </button>
            </div>
            
            {formErrors.general && (
              <div className="form-error-message">{formErrors.general}</div>
            )}
            
            <form className="material-form" onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="title">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleFormChange}
                  className={formErrors.title ? 'is-invalid' : ''}
                />
                {formErrors.title && (
                  <div className="invalid-feedback">{formErrors.title}</div>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="type">Material Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                >
                  <option value="document">Document</option>
                  <option value="link">External Link</option>
                  <option value="file">File Upload</option>
                  <option value="video">Video</option>
                  <option value="quiz">Quiz</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows={2}
                ></textarea>
              </div>
              
              {formData.type === 'document' && (
                <div className="form-group">
                  <label htmlFor="content">Content</label>
                  <textarea
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleFormChange}
                    rows={10}
                    className={formErrors.content ? 'is-invalid' : ''}
                  ></textarea>
                  {formErrors.content && (
                    <div className="invalid-feedback">{formErrors.content}</div>
                  )}
                </div>
              )}
              
              {formData.type === 'link' && (
                <div className="form-group">
                  <label htmlFor="url">URL</label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleFormChange}
                    className={formErrors.url ? 'is-invalid' : ''}
                    placeholder="https://example.com"
                  />
                  {formErrors.url && (
                    <div className="invalid-feedback">{formErrors.url}</div>
                  )}
                </div>
              )}
              
              {formData.type === 'file' && (
                <div className="form-group">
                  <label htmlFor="file">File Upload</label>
                  <input
                    type="file"
                    id="file"
                    name="file"
                    onChange={handleFormChange}
                    className={formErrors.file ? 'is-invalid' : ''}
                  />
                  {formErrors.file && (
                    <div className="invalid-feedback">{formErrors.file}</div>
                  )}
                  {formMode === 'edit' && !formData.file && (
                    <div className="file-note">
                      Leave empty to keep the current file. Upload a new file to replace it.
                    </div>
                  )}
                </div>
              )}
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={handleFormCancel}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="save-button"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseMaterials;
