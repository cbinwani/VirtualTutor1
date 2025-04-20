import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import './AdminDashboard.css';

// Admin components
import CourseManager from './admin/CourseManager';
import ModuleManager from './admin/ModuleManager';
import LessonManager from './admin/LessonManager';
import ExerciseManager from './admin/ExerciseManager';
import AvatarManager from './admin/AvatarManager';
import UserManager from './admin/UserManager';
import Analytics from './admin/Analytics';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    activeEnrollments: 0,
    completedEnrollments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/admin/stats');
        setStats(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === `/admin${path}` || 
           (location.pathname === '/admin' && path === '');
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <h2>Virtual Tutor</h2>
          <p>Admin Panel</p>
        </div>
        
        <nav className="admin-nav">
          <ul>
            <li>
              <Link to="/admin" className={isActive('') ? 'active' : ''}>
                <span className="nav-icon">📊</span>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/courses" className={isActive('/courses') ? 'active' : ''}>
                <span className="nav-icon">📚</span>
                Courses
              </Link>
            </li>
            <li>
              <Link to="/admin/modules" className={isActive('/modules') ? 'active' : ''}>
                <span className="nav-icon">📝</span>
                Modules
              </Link>
            </li>
            <li>
              <Link to="/admin/lessons" className={isActive('/lessons') ? 'active' : ''}>
                <span className="nav-icon">📖</span>
                Lessons
              </Link>
            </li>
            <li>
              <Link to="/admin/exercises" className={isActive('/exercises') ? 'active' : ''}>
                <span className="nav-icon">✏️</span>
                Exercises
              </Link>
            </li>
            <li>
              <Link to="/admin/avatars" className={isActive('/avatars') ? 'active' : ''}>
                <span className="nav-icon">👤</span>
                Avatars
              </Link>
            </li>
            <li>
              <Link to="/admin/users" className={isActive('/users') ? 'active' : ''}>
                <span className="nav-icon">👥</span>
                Users
              </Link>
            </li>
            <li>
              <Link to="/admin/analytics" className={isActive('/analytics') ? 'active' : ''}>
                <span className="nav-icon">📈</span>
                Analytics
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="admin-user-info">
          <div className="user-details">
            <p className="user-name">{user?.firstName} {user?.lastName}</p>
            <p className="user-role">Administrator</p>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </aside>
      
      <main className="admin-content">
        <header className="admin-header">
          <h1>
            {location.pathname === '/admin' && 'Admin Dashboard'}
            {location.pathname === '/admin/courses' && 'Course Management'}
            {location.pathname === '/admin/modules' && 'Module Management'}
            {location.pathname === '/admin/lessons' && 'Lesson Management'}
            {location.pathname === '/admin/exercises' && 'Exercise Management'}
            {location.pathname === '/admin/avatars' && 'Avatar Management'}
            {location.pathname === '/admin/users' && 'User Management'}
            {location.pathname === '/admin/analytics' && 'Analytics'}
          </h1>
        </header>
        
        <div className="admin-container">
          <Routes>
            <Route path="/" element={
              <div className="admin-overview">
                <div className="stats-grid">
                  <div className="stat-card">
                    <h3>Total Users</h3>
                    <p className="stat-value">{loading ? '...' : stats.totalUsers}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Total Courses</h3>
                    <p className="stat-value">{loading ? '...' : stats.totalCourses}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Active Enrollments</h3>
                    <p className="stat-value">{loading ? '...' : stats.activeEnrollments}</p>
                  </div>
                  <div className="stat-card">
                    <h3>Completed Enrollments</h3>
                    <p className="stat-value">{loading ? '...' : stats.completedEnrollments}</p>
                  </div>
                </div>
                
                <div className="quick-actions">
                  <h2>Quick Actions</h2>
                  <div className="action-buttons">
                    <Link to="/admin/courses/new" className="action-button">
                      Create New Course
                    </Link>
                    <Link to="/admin/avatars/new" className="action-button">
                      Add New Avatar
                    </Link>
                    <Link to="/admin/users" className="action-button">
                      Manage Users
                    </Link>
                    <Link to="/admin/analytics" className="action-button">
                      View Analytics
                    </Link>
                  </div>
                </div>
              </div>
            } />
            <Route path="/courses/*" element={<CourseManager />} />
            <Route path="/modules/*" element={<ModuleManager />} />
            <Route path="/lessons/*" element={<LessonManager />} />
            <Route path="/exercises/*" element={<ExerciseManager />} />
            <Route path="/avatars/*" element={<AvatarManager />} />
            <Route path="/users/*" element={<UserManager />} />
            <Route path="/analytics/*" element={<Analytics />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
