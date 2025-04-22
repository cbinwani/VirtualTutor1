import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [currentPage, selectedRole]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // In a real application, this would be an API call
      // For now, we'll simulate with mock data
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'student', status: 'active', lastLogin: '2023-04-15T10:30:00Z', coursesEnrolled: 3 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'student', status: 'active', lastLogin: '2023-04-16T14:20:00Z', coursesEnrolled: 5 },
        { id: 3, name: 'Admin User', email: 'admin@example.com', role: 'admin', status: 'active', lastLogin: '2023-04-17T09:15:00Z', coursesEnrolled: 0 },
        { id: 4, name: 'Teacher One', email: 'teacher1@example.com', role: 'teacher', status: 'active', lastLogin: '2023-04-14T11:45:00Z', coursesEnrolled: 0 },
        { id: 5, name: 'Inactive User', email: 'inactive@example.com', role: 'student', status: 'inactive', lastLogin: '2023-03-20T16:30:00Z', coursesEnrolled: 2 },
      ];
      
      // Filter by role if needed
      const filteredUsers = selectedRole === 'all' 
        ? mockUsers 
        : mockUsers.filter(user => user.role === selectedRole);
      
      // Filter by search term if provided
      const searchedUsers = searchTerm 
        ? filteredUsers.filter(user => 
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : filteredUsers;
      
      setUsers(searchedUsers);
      setTotalPages(Math.ceil(searchedUsers.length / 10)); // Assuming 10 users per page
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleRoleFilter = (e) => {
    setSelectedRole(e.target.value);
    setCurrentPage(1); // Reset to first page on new filter
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const handleBulkActionChange = (e) => {
    setBulkAction(e.target.value);
  };

  const applyBulkAction = () => {
    if (!bulkAction || selectedUsers.length === 0) return;
    
    // In a real application, this would be an API call
    // For now, we'll just log the action
    console.log(`Applying ${bulkAction} to users:`, selectedUsers);
    
    // Reset selections after action
    setSelectedUsers([]);
    setBulkAction('');
    
    // Refresh user list
    fetchUsers();
  };

  if (isLoading) {
    return (
      <div className="admin-users">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-users">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="users-header">
        <h1>User Management</h1>
        <Link to="/admin/users/new" className="add-user-button">
          Add New User
        </Link>
      </div>
      
      <div className="users-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="role-filter">
          <select value={selectedRole} onChange={handleRoleFilter}>
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>
      
      {users.length === 0 ? (
        <div className="no-users-message">
          No users found matching your criteria.
        </div>
      ) : (
        <>
          <div className="bulk-actions">
            <select 
              value={bulkAction} 
              onChange={handleBulkActionChange}
              disabled={selectedUsers.length === 0}
            >
              <option value="">Bulk Actions</option>
              <option value="activate">Activate</option>
              <option value="deactivate">Deactivate</option>
              <option value="delete">Delete</option>
            </select>
            
            <button 
              className="apply-button"
              onClick={applyBulkAction}
              disabled={!bulkAction || selectedUsers.length === 0}
            >
              Apply
            </button>
            
            <span className="selected-count">
              {selectedUsers.length} users selected
            </span>
          </div>
          
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>
                    <input 
                      type="checkbox" 
                      checked={selectedUsers.length === users.length && users.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Courses</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className={user.status === 'inactive' ? 'inactive-user' : ''}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserSelect(user.id)}
                      />
                    </td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span className={`status-indicator ${user.status}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td>{new Date(user.lastLogin).toLocaleDateString()}</td>
                    <td>{user.coursesEnrolled}</td>
                    <td>
                      <div className="action-buttons">
                        <Link to={`/admin/users/${user.id}`} className="view-button">
                          View
                        </Link>
                        <Link to={`/admin/users/${user.id}/edit`} className="edit-button">
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={currentPage === index + 1 ? 'active' : ''}
                >
                  {index + 1}
                </button>
              ))}
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminUsers;
