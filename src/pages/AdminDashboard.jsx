import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/layout/Navbar';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load requests from localStorage
    const savedRequests = localStorage.getItem('quarterRequests');
    if (savedRequests) {
      setRequests(JSON.parse(savedRequests));
    }
    setLoading(false);
  }, []);

  const handleApprove = (requestId) => {
    const updatedRequests = requests.map(request => {
      if (request.id === requestId) {
        return { ...request, status: 'approved' };
      }
      return request;
    });
    setRequests(updatedRequests);
    localStorage.setItem('quarterRequests', JSON.stringify(updatedRequests));
  };

  const handleReject = (requestId) => {
    const updatedRequests = requests.map(request => {
      if (request.id === requestId) {
        return { ...request, status: 'rejected' };
      }
      return request;
    });
    setRequests(updatedRequests);
    localStorage.setItem('quarterRequests', JSON.stringify(updatedRequests));
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <Navbar />
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Navbar />
      <div className="admin-content">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <div className="admin-info">
            <span>Welcome, {user?.name}</span>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Requests</h3>
            <p>{requests.length}</p>
          </div>
          <div className="stat-card">
            <h3>Pending</h3>
            <p>{requests.filter(r => r.status === 'pending').length}</p>
          </div>
          <div className="stat-card">
            <h3>Approved</h3>
            <p>{requests.filter(r => r.status === 'approved').length}</p>
          </div>
          <div className="stat-card">
            <h3>Rejected</h3>
            <p>{requests.filter(r => r.status === 'rejected').length}</p>
          </div>
        </div>

        <div className="requests-section">
          <h2>Quarter Allotment Requests</h2>
          <div className="requests-list">
            {requests.length === 0 ? (
              <p className="no-requests">No requests found</p>
            ) : (
              requests.map(request => (
                <div key={request.id} className={`request-card ${request.status}`}>
                  <div className="request-header">
                    <h3>{request.quarterNumber}</h3>
                    <span className={`status-badge ${request.status}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="request-details">
                    <p><strong>Applicant:</strong> {request.applicantName}</p>
                    <p><strong>Email:</strong> {request.applicantEmail}</p>
                    <p><strong>Request Date:</strong> {new Date(request.requestDate).toLocaleDateString()}</p>
                    <p><strong>Reason:</strong> {request.reason}</p>
                  </div>
                  {request.status === 'pending' && (
                    <div className="request-actions">
                      <button 
                        className="approve-btn"
                        onClick={() => handleApprove(request.id)}
                      >
                        Approve
                      </button>
                      <button 
                        className="reject-btn"
                        onClick={() => handleReject(request.id)}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 