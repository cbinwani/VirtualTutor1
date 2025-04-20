import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface CourseFormProps {
  isEditing?: boolean;
  onSubmit: (id: string | undefined, data: any) => Promise<any>;
  onCancel: () => void;
}

const CourseForm: React.FC<CourseFormProps> = ({
  isEditing = false,
  onSubmit,
  onCancel
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    gradeLevel: '',
    thumbnail: '',
    duration: '',
    skillLevels: [] as string[]
  });

  useEffect(() => {
    if (isEditing && id) {
      fetchCourse(id);
    }
  }, [isEditing, id]);

  const fetchCourse = async (courseId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/courses/${courseId}`);
      const course = response.data.data.course;
      
      setFormData({
        title: course.title || '',
        description: course.description || '',
        subject: course.subject || '',
        gradeLevel: course.gradeLevel || '',
        thumbnail: course.thumbnail || '',
        duration: course.duration || '',
        skillLevels: course.skillLevels || []
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Failed to load course data');
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

  const handleSkillLevelsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const selectedValues = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedValues.push(options[i].value);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      skillLevels: selectedValues
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
      setError(error.response?.data?.message || 'Failed to save course');
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return <div className="loading">Loading course data...</div>;
  }

  return (
    <div className="course-form">
      <h2 className="form-title">{isEditing ? 'Edit Course' : 'Create New Course'}</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Course Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="gradeLevel">Grade Level</label>
          <input
            type="text"
            id="gradeLevel"
            name="gradeLevel"
            value={formData.gradeLevel}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="thumbnail">Thumbnail URL</label>
          <input
            type="url"
            id="thumbnail"
            name="thumbnail"
            value={formData.thumbnail}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="duration">Duration (in hours)</label>
          <input
            type="text"
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="skillLevels">Skill Levels (hold Ctrl/Cmd to select multiple)</label>
          <select
            id="skillLevels"
            name="skillLevels"
            multiple
            value={formData.skillLevels}
            onChange={handleSkillLevelsChange}
            required
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
            <option value="All Levels">All Levels</option>
          </select>
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Saving...' : isEditing ? 'Update Course' : 'Create Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;
