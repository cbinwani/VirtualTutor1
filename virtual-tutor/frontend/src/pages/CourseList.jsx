import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './CourseList.css';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    level: ''
  });
  const [categories, setCategories] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // Fetch courses when component mounts
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        
        // Build query string from filters
        const queryParams = new URLSearchParams();
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.level) queryParams.append('level', filters.level);
        
        const response = await fetch(`/api/courses?${queryParams.toString()}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }
        
        const data = await response.json();
        setCourses(data.courses);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.courses.map(course => course.category))];
        setCategories(uniqueCategories);
        
        // Fetch user's enrolled courses
        const userResponse = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setEnrolledCourses(userData.enrolledCourses || []);
        }
        
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value
    }));
  };

  // Handle course enrollment
  const handleEnroll = async (courseId) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to enroll in course');
      }
      
      // Update enrolled courses
      setEnrolledCourses(prev => [...prev, courseId]);
      
      alert('Successfully enrolled in course!');
    } catch (error) {
      console.error('Error enrolling in course:', error);
      alert('Failed to enroll in course. Please try again.');
    }
  };

  // Check if user is enrolled in a course
  const isEnrolled = (courseId) => {
    return enrolledCourses.includes(courseId);
  };

  return (
    <div className="course-list-container">
      <div className="course-list-header">
        <h1>Available Courses</h1>
        <div className="course-filters">
          <div className="filter-group">
            <label htmlFor="category-filter">Category:</label>
            <select
              id="category-filter"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="level-filter">Level:</label>
            <select
              id="level-filter"
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading courses...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.length === 0 ? (
            <div className="no-courses-message">
              <p>No courses found matching your filters.</p>
            </div>
          ) : (
            courses.map(course => (
              <div key={course.courseId} className="course-card">
                <div className="course-level">{course.level}</div>
                <h2 className="course-title">{course.title}</h2>
                <p className="course-description">{course.description}</p>
                <div className="course-details">
                  <span className="course-category">{course.category}</span>
                  <span className="course-duration">{course.duration}</span>
                </div>
                <div className="course-topics">
                  <h3>Topics:</h3>
                  <ul>
                    {course.topics.slice(0, 3).map((topic, index) => (
                      <li key={index}>{topic}</li>
                    ))}
                    {course.topics.length > 3 && (
                      <li className="more-topics">+{course.topics.length - 3} more</li>
                    )}
                  </ul>
                </div>
                <div className="course-actions">
                  {isEnrolled(course.courseId) ? (
                    <Link to={`/courses/${course.courseId}`} className="view-course-button">
                      View Course
                    </Link>
                  ) : (
                    <button 
                      className="enroll-button"
                      onClick={() => handleEnroll(course.courseId)}
                    >
                      Enroll Now
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CourseList;
