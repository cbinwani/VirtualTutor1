import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './AdminSidebar.css';

const AdminSidebar = ({ collapsed }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === `/admin${path}` || location.pathname.startsWith(`/admin${path}/`);
  };
  
  return (
    <div className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="admin-sidebar-header">
        <h1>Virtual Tutor</h1>
        <div className="admin-logo">VT</div>
      </div>
      
      <div className="admin-sidebar-content">
        <ul className="sidebar-menu">
          <li className={`sidebar-item ${isActive('') ? 'active' : ''}`}>
            <Link to="/admin">
              <div className="sidebar-item-icon dashboard-icon"></div>
              <span className="sidebar-item-text">Dashboard</span>
            </Link>
          </li>
          
          <li className={`sidebar-item ${isActive('/courses') ? 'active' : ''}`}>
            <Link to="/admin/courses">
              <div className="sidebar-item-icon courses-icon"></div>
              <span className="sidebar-item-text">Courses</span>
            </Link>
          </li>
          
          <li className={`sidebar-item ${isActive('/users') ? 'active' : ''}`}>
            <Link to="/admin/users">
              <div className="sidebar-item-icon users-icon"></div>
              <span className="sidebar-item-text">Users</span>
            </Link>
          </li>
          
          <li className={`sidebar-item ${isActive('/avatars') ? 'active' : ''}`}>
            <Link to="/admin/avatars">
              <div className="sidebar-item-icon avatars-icon"></div>
              <span className="sidebar-item-text">Avatars</span>
            </Link>
          </li>
          
          <li className={`sidebar-item ${isActive('/analytics') ? 'active' : ''}`}>
            <Link to="/admin/analytics">
              <div className="sidebar-item-icon analytics-icon"></div>
              <span className="sidebar-item-text">Analytics</span>
            </Link>
          </li>
          
          <li className={`sidebar-item ${isActive('/settings') ? 'active' : ''}`}>
            <Link to="/admin/settings">
              <div className="sidebar-item-icon settings-icon"></div>
              <span className="sidebar-item-text">Settings</span>
            </Link>
          </li>
        </ul>
      </div>
      
      <div className="admin-sidebar-footer">
        <Link to="/" className="view-site-link">
          <div className="sidebar-item-icon site-icon"></div>
          <span className="sidebar-item-text">View Site</span>
        </Link>
      </div>
    </div>
  );
};

export default AdminSidebar;
