import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import './CourseManager.css';

// Course components
import CourseForm from './CourseForm';
import CourseList from './CourseList';
import CourseDetail from './CourseDetail';

const CourseManager: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/courses');
      setCourses(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses');
      setLoading(false);
    }
  };

  const handleCreateCourse = async (courseData: any) => {
    try {
      const response = await axios.post('/api/courses', courseData);
      setCourses([...courses, response.data.data]);
      navigate('/admin/courses');
      return response.data.data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  };

  const handleUpdateCourse = async (id: string, courseData: any) => {
    try {
      const response = await axios.put(`/api/courses/${id}`, courseData);
      setCourses(courses.map(course => 
        course._id === id ? response.data.data : course
      ));
      navigate(`/admin/courses/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  };

  const handleDeleteCourse = async (id: string) => {
    try {
      await axios.delete(`/api/courses/${id}`);
      setCourses(courses.filter(course => course._id !== id));
      navigate('/admin/courses');
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  };

  return (
    <div className="course-manager">
      <Routes>
        <Route path="/" element={
          <>
            <div className="manager-header">
              <h2>Course Management</h2>
              <Link to="/admin/courses/new" className="create-button">
                Create New Course
              </Link>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            {loading ? (
              <div className="loading">Loading courses...</div>
            ) : (
              <CourseList 
                courses={courses} 
                onRefresh={fetchCourses} 
              />
            )}
          </>
        } />
        
        <Route path="/new" element={
          <CourseForm 
            onSubmit={handleCreateCourse} 
            onCancel={() => navigate('/admin/courses')} 
          />
        } />
        
        <Route path="/:id" element={
          <CourseDetail 
            onUpdate={handleUpdateCourse}
            onDelete={handleDeleteCourse}
          />
        } />
        
        <Route path="/:id/edit" element={
          <CourseForm 
            isEditing={true}
            onSubmit={handleUpdateCourse}
            onCancel={() => navigate('/admin/courses')}
          />
        } />
      </Routes>
    </div>
  );
};

export default CourseManager;
