import React, { useState, useEffect } from 'react';
import { getAdminStats } from '../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getAdminStats();
      setStats(response.data.data);
    } catch (err) {
      setError('Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading admin dashboard...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!stats) return <div className="error">No data available</div>;

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
            <p className="metric-value">{stats.totalUsers}</p>
            <span className="metric-label">Registered users</span>
          </div>
        </div>

        <div className="metric-card bookings">
          <div className="metric-icon">📅</div>
          <div className="metric-content">
            <h3>Total Bookings</h3>
            <p className="metric-value">{stats.totalBookings}</p>
            <span className="metric-label">All time bookings</span>
          </div>
        </div>

        <div className="metric-card revenue">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <h3>Total Revenue</h3>
            <p className="metric-value">₹{stats.totalRevenue.toLocaleString()}</p>
            <span className="metric-label">Total earnings</span>
          </div>
        </div>

        <div className="metric-card turfs">
          <div className="metric-icon">🏟️</div>
          <div className="metric-content">
            <h3>Active Turfs</h3>
            <p className="metric-value">{stats.activeTurfs}</p>
            <span className="metric-label">Currently active</span>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="recent-bookings-section">
        <h2>Recent 10 Bookings</h2>
        <div className="bookings-table-container">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User</th>
                <th>Turf</th>
                <th>Date</th>
                <th>Time</th>
                <th>Sport</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentBookings.map((booking, index) => (
                <tr key={booking._id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="user-cell">
                      <span className="user-name">{booking.user?.name}</span>
                      <span className="user-email">{booking.user?.email}</span>
                    </div>
                  </td>
                  <td>
                    <div className="turf-cell">
                      <span className="turf-name">{booking.turf?.name}</span>
                      <span className="turf-location">
                        {booking.turf?.location?.city}
                      </span>
                    </div>
                  </td>
                  <td>{new Date(booking.date).toLocaleDateString()}</td>
                  <td>{booking.startTime} - {booking.endTime}</td>
                  <td>
                    <span className="sport-badge">{booking.sport}</span>
                  </td>
                  <td className="amount">₹{booking.payment.amount}</td>
                  <td>
                    <span className={`status-badge ${booking.status}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;