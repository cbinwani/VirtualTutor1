import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    activeSessions: 0,
    newUsersToday: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch dashboard statistics
        const statsResponse = await fetch('/api/admin/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch dashboard statistics');
        }
        
        const statsData = await statsResponse.json();
        setStats(statsData);
        
        // Fetch recent activity
        const activityResponse = await fetch('/api/admin/dashboard/activity', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!activityResponse.ok) {
          throw new Error('Failed to fetch recent activity');
        }
        
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.activities || []);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="dashboard-actions">
          <Link to="/admin/courses/new" className="action-button create-course">
            Create New Course
          </Link>
        </div>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users-icon"></div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-footer">
            <span className="stat-change positive">+{stats.newUsersToday} today</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon courses-icon"></div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalCourses}</div>
            <div className="stat-label">Total Courses</div>
          </div>
          <div className="stat-footer">
            <Link to="/admin/courses" className="stat-link">View all courses</Link>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon sessions-icon"></div>
          <div className="stat-content">
            <div className="stat-value">{stats.activeSessions}</div>
            <div className="stat-label">Active Sessions</div>
          </div>
          <div className="stat-footer">
            <span className="stat-info">Live tutoring sessions</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon performance-icon"></div>
          <div className="stat-content">
            <div className="stat-value">{stats.averageRating || '0.0'}</div>
            <div className="stat-label">Average Rating</div>
          </div>
          <div className="stat-footer">
            <span className="stat-info">Based on user feedback</span>
          </div>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <Link to="/admin/activity" className="view-all-link">
              View All
            </Link>
          </div>
          
          <div className="activity-list">
            {recentActivity.length === 0 ? (
              <div className="no-activity">
                <p>No recent activity to display.</p>
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className={`activity-icon ${activity.type}-icon`}></div>
                  <div className="activity-content">
                    <div className="activity-title">{activity.title}</div>
                    <div className="activity-description">{activity.description}</div>
                  </div>
                  <div className="activity-meta">
                    <div className="activity-time">
                      {new Date(activity.timestamp).toLocaleString()}
                    </div>
                    <div className="activity-user">{activity.user}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          
          <div className="quick-actions">
            <Link to="/admin/courses" className="quick-action-card">
              <div className="quick-action-icon manage-courses-icon"></div>
              <div className="quick-action-title">Manage Courses</div>
              <div className="quick-action-description">
                Add, edit, or remove courses and course materials
              </div>
            </Link>
            
            <Link to="/admin/users" className="quick-action-card">
              <div className="quick-action-icon manage-users-icon"></div>
              <div className="quick-action-title">Manage Users</div>
              <div className="quick-action-description">
                View and manage user accounts and permissions
              </div>
            </Link>
            
            <Link to="/admin/avatars" className="quick-action-card">
              <div className="quick-action-icon manage-avatars-icon"></div>
              <div className="quick-action-title">Manage Avatars</div>
              <div className="quick-action-description">
                Configure digital human avatars for tutoring
              </div>
            </Link>
            
            <Link to="/admin/analytics" className="quick-action-card">
              <div className="quick-action-icon analytics-icon"></div>
              <div className="quick-action-title">Analytics</div>
              <div className="quick-action-description">
                View detailed usage and performance analytics
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
