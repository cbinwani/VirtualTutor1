import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

interface CourseDetailProps {
  onUpdate: (id: string, data: any) => Promise<any>;
  onDelete: (id: string) => Promise<void>;
}

const CourseDetail: React.FC<CourseDetailProps> = ({ onUpdate, onDelete }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      fetchCourseDetails(id);
    }
  }, [id]);

  const fetchCourseDetails = async (courseId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/courses/${courseId}`);
      setCourse(response.data.data.course);
      setModules(response.data.data.modules || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching course details:', error);
      setError('Failed to load course details');
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
      navigate('/admin/courses');
    } catch (error) {
      setError('Failed to delete course');
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  if (loading) {
    return <div className="loading">Loading course details...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!course) {
    return <div className="error-message">Course not found</div>;
  }

  return (
    <div className="course-detail">
      <div className="course-header">
        <div>
          <h2 className="course-title">{course.title}</h2>
          <p className="course-subject">{course.subject}</p>
        </div>
        <div className="course-header-actions">
          <Link to={`/admin/courses/${id}/edit`} className="course-action-button edit-button">
            Edit Course
          </Link>
          <button onClick={handleDeleteClick} className="course-action-button delete-button">
            Delete Course
          </button>
        </div>
      </div>
      
      {course.thumbnail && (
        <div className="course-detail-image">
          <img src={course.thumbnail} alt={course.title} />
        </div>
      )}
      
      <div className="course-meta">
        <div className="meta-item">
          <span className="meta-label">Grade Level</span>
          <span className="meta-value">{course.gradeLevel}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Duration</span>
          <span className="meta-value">{course.duration}</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Created By</span>
          <span className="meta-value">
            {course.createdBy?.firstName} {course.createdBy?.lastName}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Created On</span>
          <span className="meta-value">
            {new Date(course.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      <div className="course-full-description">
        <h3>Description</h3>
        <p>{course.description}</p>
      </div>
      
      <div className="skill-levels">
        <h3>Skill Levels</h3>
        {course.skillLevels?.map((skill: string) => (
          <span key={skill} className="skill-badge">{skill}</span>
        ))}
      </div>
      
      <div className="course-modules">
        <div className="modules-header">
          <h3>Course Modules</h3>
          <Link to={`/admin/modules/new?courseId=${id}`} className="course-action-button view-button">
            Add Module
          </Link>
        </div>
        
        {modules.length === 0 ? (
          <p>No modules available for this course yet.</p>
        ) : (
          <div className="modules-list">
            {modules.map((module: any) => (
              <div key={module._id} className="module-item">
                <div className="module-info">
                  <h4>{module.title}</h4>
                  <p>{module.description}</p>
                </div>
                <div className="module-actions">
                  <Link to={`/admin/modules/${module._id}`} className="course-action-button view-button">
                    View
                  </Link>
                  <Link to={`/admin/modules/${module._id}/edit`} className="course-action-button edit-button">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {showDeleteConfirm && (
        <div className="delete-confirmation">
          <div className="delete-confirmation-content">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this course? This action cannot be undone.</p>
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

export default CourseDetail;
