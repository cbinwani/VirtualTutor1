import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

interface Course {
  _id: string;
  title: string;
  description: string;
  subject: string;
  thumbnail: string;
  skillLevels: string[];
}

interface Enrollment {
  _id: string;
  courseId: Course;
  progress: number;
  lastAccessDate: Date;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch user enrollments
        const enrollmentsResponse = await axios.get('/api/enrollments/user');
        setEnrollments(enrollmentsResponse.data.data);
        
        // Fetch recommended courses
        const coursesResponse = await axios.get('/api/courses/recommended');
        setRecommendedCourses(coursesResponse.data.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const handleContinueLearning = (courseId: string) => {
    navigate(`/tutor/${courseId}`);
  };

  const handleExploreNewCourse = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {user?.firstName}!</h1>
        <p>Continue your learning journey with Virtual Tutor</p>
      </header>
      
      <section className="dashboard-section">
        <h2>Your Courses</h2>
        {error && <div className="error-message">{error}</div>}
        
        {enrollments.length === 0 ? (
          <div className="empty-state">
            <p>You haven't enrolled in any courses yet.</p>
            <button 
              className="primary-button"
              onClick={() => navigate('/courses')}
            >
              Browse Courses
            </button>
          </div>
        ) : (
          <div className="course-grid">
            {enrollments.map(enrollment => (
              <div key={enrollment._id} className="course-card">
                <div className="course-image">
                  <img src={enrollment.courseId.thumbnail} alt={enrollment.courseId.title} />
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${enrollment.progress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="course-info">
                  <h3>{enrollment.courseId.title}</h3>
                  <p className="course-subject">{enrollment.courseId.subject}</p>
                  <div className="course-progress">
                    <span className="progress-text">{enrollment.progress}% Complete</span>
                    <span className="last-access">
                      Last accessed: {new Date(enrollment.lastAccessDate).toLocaleDateString()}
                    </span>
                  </div>
                  <button 
                    className="continue-button"
                    onClick={() => handleContinueLearning(enrollment.courseId._id)}
                  >
                    Continue Learning
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      <section className="dashboard-section">
        <h2>Recommended for You</h2>
        {recommendedCourses.length === 0 ? (
          <div className="empty-state">
            <p>No recommendations available at the moment.</p>
          </div>
        ) : (
          <div className="course-grid">
            {recommendedCourses.map(course => (
              <div key={course._id} className="course-card recommended">
                <div className="course-image">
                  <img src={course.thumbnail} alt={course.title} />
                  <div className="course-badge">Recommended</div>
                </div>
                <div className="course-info">
                  <h3>{course.title}</h3>
                  <p className="course-subject">{course.subject}</p>
                  <p className="course-description">{course.description.substring(0, 100)}...</p>
                  <div className="skill-levels">
                    {course.skillLevels.map(level => (
                      <span key={level} className="skill-badge">{level}</span>
                    ))}
                  </div>
                  <button 
                    className="explore-button"
                    onClick={() => handleExploreNewCourse(course._id)}
                  >
                    Explore Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
