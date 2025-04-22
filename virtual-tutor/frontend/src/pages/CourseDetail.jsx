import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './CourseDetail.css';

const CourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Fetch course details and progress when component mounts
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch course details
        const courseResponse = await fetch(`/api/courses/${courseId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!courseResponse.ok) {
          throw new Error('Failed to fetch course details');
        }
        
        const courseData = await courseResponse.json();
        setCourse(courseData);
        
        // Fetch course progress
        const progressResponse = await fetch(`/api/courses/${courseId}/progress`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          setProgress(progressData);
          
          // Set selected topic to current topic or first topic
          setSelectedTopic(progressData.currentTopic || (courseData.topics.length > 0 ? courseData.topics[0].topicId : null));
        }
        
      } catch (error) {
        console.error('Error fetching course data:', error);
        setError('Failed to load course details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourseData();
  }, [courseId]);

  // Get topic details by ID
  const getTopicById = (topicId) => {
    if (!course || !course.topics) return null;
    return course.topics.find(topic => topic.topicId === topicId);
  };

  // Get materials for selected topic
  const getTopicMaterials = () => {
    if (!course || !course.materials || !selectedTopic) return [];
    return course.materials.filter(material => material.topicId === selectedTopic);
  };

  // Check if a topic is completed
  const isTopicCompleted = (topicId) => {
    if (!progress || !progress.completedTopics) return false;
    return progress.completedTopics.includes(topicId);
  };

  // Start a tutoring session for the selected topic
  const startTutoringSession = () => {
    if (!selectedTopic) return;
    window.location.href = `/tutor-session/${courseId}/${selectedTopic}`;
  };

  return (
    <div className="course-detail-container">
      {isLoading ? (
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading course details...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      ) : course ? (
        <>
          <div className="course-header">
            <div className="course-header-content">
              <h1 className="course-title">{course.title}</h1>
              <div className="course-meta">
                <span className="course-category">{course.category}</span>
                <span className="course-level">{course.level}</span>
                <span className="course-duration">{course.duration}</span>
              </div>
              <p className="course-description">{course.description}</p>
            </div>
            
            {progress && (
              <div className="course-progress">
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${progress.progress}%` }}
                  ></div>
                </div>
                <div className="progress-text">{progress.progress}% Complete</div>
              </div>
            )}
          </div>
          
          <div className="course-content">
            <div className="topics-sidebar">
              <h2>Course Topics</h2>
              <ul className="topics-list">
                {course.topics.map(topic => (
                  <li 
                    key={topic.topicId}
                    className={`topic-item ${selectedTopic === topic.topicId ? 'selected' : ''} ${isTopicCompleted(topic.topicId) ? 'completed' : ''}`}
                    onClick={() => setSelectedTopic(topic.topicId)}
                  >
                    <div className="topic-title">
                      {topic.title}
                      {isTopicCompleted(topic.topicId) && (
                        <span className="completed-icon">✓</span>
                      )}
                    </div>
                    <div className="topic-duration">{topic.estimatedDuration}</div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="topic-content">
              {selectedTopic ? (
                <>
                  <div className="topic-header">
                    <h2>{getTopicById(selectedTopic)?.title}</h2>
                    <button 
                      className="start-session-button"
                      onClick={startTutoringSession}
                    >
                      Start Tutoring Session
                    </button>
                  </div>
                  
                  <p className="topic-description">
                    {getTopicById(selectedTopic)?.description}
                  </p>
                  
                  <div className="topic-materials">
                    <h3>Learning Materials</h3>
                    {getTopicMaterials().length > 0 ? (
                      <ul className="materials-list">
                        {getTopicMaterials().map(material => (
                          <li key={material.materialId} className="material-item">
                            <div className={`material-icon ${material.type}`}></div>
                            <div className="material-details">
                              <div className="material-title">{material.title}</div>
                              <div className="material-type">{material.type}</div>
                            </div>
                            <a 
                              href={material.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="view-material-button"
                            >
                              View
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-materials-message">
                        No materials available for this topic yet.
                      </p>
                    )}
                  </div>
                  
                  {progress && progress.improvementAreas && progress.improvementAreas.length > 0 && (
                    <div className="improvement-areas">
                      <h3>Areas for Improvement</h3>
                      <ul className="improvement-list">
                        {progress.improvementAreas.map((area, index) => (
                          <li key={index} className="improvement-item">{area}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="no-topic-selected">
                  <p>Select a topic from the sidebar to view its content.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="course-footer">
            <div className="course-objectives">
              <h3>Course Objectives</h3>
              <ul>
                {course.objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>
            
            {course.prerequisites && course.prerequisites.length > 0 && (
              <div className="course-prerequisites">
                <h3>Prerequisites</h3>
                <ul>
                  {course.prerequisites.map((prerequisite, index) => (
                    <li key={index}>{prerequisite}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="not-found-message">
          <h2>Course Not Found</h2>
          <p>The course you're looking for doesn't exist or you don't have access to it.</p>
          <Link to="/courses" className="back-to-courses-button">
            Back to Courses
          </Link>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
