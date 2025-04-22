import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminCourses.css';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/admin/courses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }
      
      const data = await response.json();
      setCourses(data.courses || []);
      
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const handleCourseSelect = (courseId) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedCourses.length === filteredCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses(filteredCourses.map(course => course.courseId));
    }
  };

  const handleDeleteSelected = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch('/api/admin/courses/batch-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ courseIds: selectedCourses })
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete courses');
      }
      
      // Refresh courses list
      fetchCourses();
      
      // Clear selection and close modal
      setSelectedCourses([]);
      setIsDeleteModalOpen(false);
      
    } catch (error) {
      console.error('Error deleting courses:', error);
      alert('Failed to delete courses. Please try again.');
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
  };

  // Filter courses based on search term and filter
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') {
      return matchesSearch;
    } else {
      return matchesSearch && course.status === filter;
    }
  });

  // Sort filtered courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortBy === 'category') {
      comparison = a.category.localeCompare(b.category);
    } else if (sortBy === 'enrollments') {
      comparison = a.enrollmentCount - b.enrollmentCount;
    } else if (sortBy === 'date') {
      comparison = new Date(a.createdAt) - new Date(b.createdAt);
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  if (isLoading) {
    return (
      <div className="admin-courses">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-courses">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchCourses} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-courses">
      <div className="courses-header">
        <h1>Manage Courses</h1>
        <div className="header-actions">
          <Link to="/admin/courses/new" className="create-course-button">
            Create New Course
          </Link>
        </div>
      </div>
      
      <div className="courses-toolbar">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="filter">Status:</label>
            <select id="filter" value={filter} onChange={handleFilterChange}>
              <option value="all">All Courses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label htmlFor="sort">Sort by:</label>
            <select id="sort" value={sortBy} onChange={handleSortChange}>
              <option value="title">Title</option>
              <option value="category">Category</option>
              <option value="enrollments">Enrollments</option>
              <option value="date">Creation Date</option>
            </select>
            <button 
              className="sort-order-button" 
              onClick={handleSortOrderToggle}
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>
      
      {selectedCourses.length > 0 && (
        <div className="bulk-actions">
          <span className="selected-count">
            {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected
          </span>
          <button 
            className="delete-selected-button"
            onClick={handleDeleteSelected}
          >
            Delete Selected
          </button>
        </div>
      )}
      
      {sortedCourses.length === 0 ? (
        <div className="no-courses">
          <p>No courses found matching your criteria.</p>
          {searchTerm || filter !== 'all' ? (
            <button 
              className="clear-filters-button"
              onClick={() => {
                setSearchTerm('');
                setFilter('all');
              }}
            >
              Clear Filters
            </button>
          ) : (
            <Link to="/admin/courses/new" className="create-course-link">
              Create your first course
            </Link>
          )}
        </div>
      ) : (
        <div className="courses-table-container">
          <table className="courses-table">
            <thead>
              <tr>
                <th className="checkbox-column">
                  <input 
                    type="checkbox" 
                    checked={selectedCourses.length === sortedCourses.length && sortedCourses.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Title</th>
                <th>Category</th>
                <th>Level</th>
                <th>Status</th>
                <th>Enrollments</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedCourses.map(course => (
                <tr key={course.courseId} className={selectedCourses.includes(course.courseId) ? 'selected' : ''}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedCourses.includes(course.courseId)}
                      onChange={() => handleCourseSelect(course.courseId)}
                    />
                  </td>
                  <td className="title-column">
                    <div className="course-title-cell">
                      <span className="course-title">{course.title}</span>
                      {course.topics && (
                        <span className="topic-count">
                          {course.topics.length} topic{course.topics.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{course.category}</td>
                  <td>{course.level}</td>
                  <td>
                    <span className={`status-badge ${course.status}`}>
                      {course.status}
                    </span>
                  </td>
                  <td>{course.enrollmentCount || 0}</td>
                  <td>{new Date(course.updatedAt).toLocaleDateString()}</td>
                  <td className="actions-column">
                    <div className="action-buttons">
                      <Link 
                        to={`/admin/courses/${course.courseId}/edit`}
                        className="edit-button"
                        title="Edit Course"
                      >
                        Edit
                      </Link>
                      <Link 
                        to={`/admin/courses/${course.courseId}/materials`}
                        className="materials-button"
                        title="Manage Materials"
                      >
                        Materials
                      </Link>
                      <Link 
                        to={`/courses/${course.courseId}`}
                        className="view-button"
                        title="View Course"
                        target="_blank"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {isDeleteModalOpen && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <h2>Confirm Deletion</h2>
            <p>
              Are you sure you want to delete {selectedCourses.length} selected 
              course{selectedCourses.length !== 1 ? 's' : ''}? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button className="cancel-button" onClick={cancelDelete}>
                Cancel
              </button>
              <button className="delete-button" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
