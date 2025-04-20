import React from 'react';
import { Link } from 'react-router-dom';

interface CourseListProps {
  courses: any[];
  onRefresh: () => void;
}

const CourseList: React.FC<CourseListProps> = ({ courses, onRefresh }) => {
  if (courses.length === 0) {
    return (
      <div className="empty-state">
        <p>No courses available. Create your first course to get started.</p>
        <Link to="/admin/courses/new" className="create-button">
          Create New Course
        </Link>
      </div>
    );
  }

  return (
    <div className="course-list">
      {courses.map(course => (
        <div key={course._id} className="course-card">
          <div className="course-image">
            <img src={course.thumbnail} alt={course.title} />
          </div>
          <div className="course-info">
            <h3>{course.title}</h3>
            <p className="course-subject">{course.subject}</p>
            <p className="course-description">{course.description}</p>
            <div className="course-actions">
              <Link to={`/admin/courses/${course._id}`} className="course-action-button view-button">
                View
              </Link>
              <Link to={`/admin/courses/${course._id}/edit`} className="course-action-button edit-button">
                Edit
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CourseList;
