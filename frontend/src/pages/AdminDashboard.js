// src/pages/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { getAdminStats } from '../services/api';
import { toast } from 'react-toastify';
import './AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingTurfs, setPendingTurfs] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingTurf, setViewingTurf] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // We call both the stats and the turfs list simultaneously
      const [statsRes, turfsRes] = await Promise.all([
        getAdminStats(),
        axios.get('http://localhost:5000/api/turfs', config)
      ]);
      
      setStats(statsRes.data.data);
      
      // Filter for turfs that specifically have isApproved: false
      // Note: Because of our backend update, the admin will now receive ALL turfs here
      const pending = turfsRes.data.data.filter(turf => turf.isApproved === false);
      setPendingTurfs(pending);
      
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError('Failed to load dashboard data. Please ensure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const config = { 
        headers: { Authorization: `Bearer ${token}` } 
      };
      
      // Using backticks to ensure the ID is correctly injected into the URL
      const res = await axios.put(`http://localhost:5000/api/turfs/${id}/approve`, {}, config);
      
      if (res.data.success) {
        toast.success('Turf approved successfully!');
        setViewingTurf(null); // Close the modal
        await fetchData(); // Refresh the list and stats
      }
    } catch (err) {
      console.error("Approve Error:", err);
      toast.error(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Are you sure you want to reject this turf? This will delete the request permanently.")) {
      try {
        const token = localStorage.getItem('token');
        const config = { 
          headers: { Authorization: `Bearer ${token}` } 
        };
        
        const res = await axios.delete(`http://localhost:5000/api/turfs/${id}`, config);
        
        if (res.data.success) {
          toast.info('Turf request rejected and removed.');
          setViewingTurf(null); // Close the modal
          await fetchData(); // Refresh data
        }
      } catch (err) {
        console.error("Reject Error:", err);
        toast.error(err.response?.data?.message || 'Rejection failed');
      }
    }
  };

  if (loading) return <div className="loading">Loading admin dashboard...</div>;
  if (error) return (
    <div className="error-container">
      <div className="error">{error}</div>
      <button onClick={fetchData} className="btn-retry">Retry</button>
    </div>
  );

  return (
    <div className="admin-dashboard-page">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>System overview and statistics</p>
      </div>

      {/* Metric Cards */}
      <div className="metrics-grid">
        <div className="metric-card users">
          <div className="metric-icon">👥</div>
          <div className="metric-content">
            <h3>Total Users</h3>
            <p className="metric-value">{stats?.totalUsers || 0}</p>
          </div>
        </div>
        <div className="metric-card bookings">
          <div className="metric-icon">📅</div>
          <div className="metric-content">
            <h3>Total Bookings</h3>
            <p className="metric-value">{stats?.totalBookings || 0}</p>
          </div>
        </div>
        <div className="metric-card revenue">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>Total Revenue</h3>
            <p className="metric-value">৳{stats?.totalRevenue?.toLocaleString() || 0}</p>
          </div>
        </div>
        <div className="metric-card turfs">
          <div className="metric-icon">🏟️</div>
          <div className="metric-content">
            <h3>Active Turfs</h3>
            <p className="metric-value">{stats?.activeTurfs || 0}</p>
          </div>
        </div>
      </div>

      {/* Pending Approvals Section */}
      <div className="recent-bookings-section mb-5">
        <div className="section-header-flex">
          <h2 className="section-title">Pending Turf Approvals</h2>
          <button onClick={fetchData} className="btn-refresh-small">Refresh List</button>
        </div>
        
        {pendingTurfs.length === 0 ? (
          <div className="info-note">No pending registration requests.</div>
        ) : (
          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>Turf Name</th>
                  <th>Owner</th>
                  <th>Location</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingTurfs.map((turf) => (
                  <tr key={turf._id}>
                    <td><strong>{turf.name}</strong></td>
                    <td>
                      <div className="user-cell">
                        <span className="user-name">{turf.owner?.name || 'Pending Owner Info'}</span>
                        <span className="user-email">{turf.owner?.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td>{turf.location?.city}</td>
                    <td>
                      <button onClick={() => setViewingTurf(turf)} className="btn-view-details">
                        View Form
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL BLOCK --- */}
      {viewingTurf && (
        <div className="admin-modal-overlay" onClick={() => setViewingTurf(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2>Turf Registration Details</h2>
              <button className="admin-close-modal" onClick={() => setViewingTurf(null)}>&times;</button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-detail-section">
                <div className="admin-detail-item">
                  <label>Turf Name</label>
                  <p>{viewingTurf.name}</p>
                </div>
                <div className="admin-detail-item">
                  <label>Price Per Hour</label>
                  <p className="amount">৳{viewingTurf.pricePerHour}</p>
                </div>
                <div className="admin-detail-item">
                  <label>City</label>
                  <p>{viewingTurf.location?.city}</p>
                </div>
                <div className="admin-detail-item">
                  <label>Full Address</label>
                  <p>{viewingTurf.location?.address}</p>
                </div>
              </div>

              <div className="admin-detail-item full-width" style={{ marginTop: '20px' }}>
                <label>Description</label>
                <div className="admin-description-box">{viewingTurf.description}</div>
              </div>

              <div className="admin-detail-item full-width" style={{ marginTop: '20px' }}>
                <label>Available Sports</label>
                <div className="admin-badge-list">
                  {viewingTurf.sports?.map(s => <span key={s} className="sport-badge">{s}</span>)}
                </div>
              </div>

              <div className="admin-detail-item full-width" style={{ marginTop: '20px' }}>
                <label>Facilities</label>
                <div className="admin-badge-list">
                  {viewingTurf.facilities?.map(f => <span key={f} className="facility-badge">{f}</span>)}
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button onClick={() => handleApprove(viewingTurf._id)} className="btn-approve-action">Approve Turf</button>
              <button onClick={() => handleReject(viewingTurf._id)} className="btn-reject-action">Reject Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;