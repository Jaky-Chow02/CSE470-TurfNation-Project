import React, { useState, useEffect } from 'react';
import { getMyTurfs, getTurfBookings, addAnnouncement } from '../services/api';
import './OwnerDashboard.css';

function OwnerDashboard() {
  const [turfs, setTurfs] = useState([]);
  const [selectedTurf, setSelectedTurf] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ date: '', status: '' });
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    fetchTurfs();
  }, []);

  useEffect(() => {
    if (selectedTurf) {
      fetchBookings();
    }
  }, [selectedTurf, filter]);

  const fetchTurfs = async () => {
    try {
      const response = await getMyTurfs();
      setTurfs(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedTurf(response.data.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load turfs');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const params = {};
      if (filter.date) params.date = filter.date;
      if (filter.status) params.status = filter.status;
      
      const response = await getTurfBookings(selectedTurf, params);
      setBookings(response.data.data);
    } catch (err) {
      console.error('Failed to load bookings');
    }
  };

  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await addAnnouncement(selectedTurf, announcement);
      setShowAnnouncementModal(false);
      setAnnouncement('');
      alert('Announcement added successfully!');
      fetchTurfs();
    } catch (err) {
      alert('Failed to add announcement');
    }
  };

  const calculateRevenue = () => {
    return bookings
      .filter(b => b.status === 'confirmed' || b.status === 'completed')
      .reduce((sum, b) => sum + b.payment.amount, 0);
  };

  const getUpcomingBookings = () => {
    const today = new Date();
    return bookings.filter(b => 
      new Date(b.date) >= today && 
      (b.status === 'confirmed' || b.status === 'pending')
    );
  };

  const getTodayBookings = () => {
    const today = new Date().toISOString().split('T')[0];
    return bookings.filter(b => 
      b.date.split('T')[0] === today &&
      (b.status === 'confirmed' || b.status === 'pending')
    );
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  if (turfs.length === 0) {
    return (
      <div className="owner-dashboard-page">
        <div className="no-turfs">
          <h2>No Turfs Found</h2>
          <p>You don't have any turfs yet. Create one to start managing bookings!</p>
        </div>
      </div>
    );
  }

  const selectedTurfData = turfs.find(t => t._id === selectedTurf);

  return (
    <div className="owner-dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Turf Owner Dashboard</h1>
          <p>Manage your turfs and bookings</p>
        </div>
        <button 
          className="btn-announcement"
          onClick={() => setShowAnnouncementModal(true)}
        >
          📢 Add Announcement
        </button>
      </div>

      {/* Turf Selector */}
      <div className="turf-selector">
        <label>Select Turf:</label>
        <select 
          value={selectedTurf} 
          onChange={(e) => setSelectedTurf(e.target.value)}
          className="turf-select"
        >
          {turfs.map((turf) => (
            <option key={turf._id} value={turf._id}>
              {turf.name}
            </option>
          ))}
        </select>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Bookings</h3>
            <p className="stat-value">{bookings.length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <h3>Today's Bookings</h3>
            <p className="stat-value">{getTodayBookings().length}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <h3>Upcoming</h3>
            <p className="stat-value">{getUpcomingBookings().length}</p>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Revenue</h3>
            <p className="stat-value">₹{calculateRevenue()}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <h2>Bookings</h2>
        <div className="filters">
          <input
            type="date"
            value={filter.date}
            onChange={(e) => setFilter({ ...filter, date: e.target.value })}
            className="filter-input"
          />
          <select
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button 
            onClick={() => setFilter({ date: '', status: '' })}
            className="btn-clear"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bookings-section">
        {bookings.length === 0 ? (
          <div className="no-bookings">
            <p>No bookings found</p>
          </div>
        ) : (
          <div className="bookings-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Customer</th>
                  <th>Sport</th>
                  <th>Duration</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{new Date(booking.date).toLocaleDateString()}</td>
                    <td>{booking.startTime} - {booking.endTime}</td>
                    <td>
                      <div className="customer-info">
                        <span className="customer-name">{booking.user?.name}</span>
                        <span className="customer-email">{booking.user?.email}</span>
                      </div>
                    </td>
                    <td>{booking.sport}</td>
                    <td>{booking.duration}h</td>
                    <td>₹{booking.payment.amount}</td>
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
        )}
      </div>

      {/* Recent Announcements */}
      {selectedTurfData?.announcements && selectedTurfData.announcements.length > 0 && (
        <div className="announcements-section">
          <h2>Recent Announcements</h2>
          <div className="announcements-list">
            {selectedTurfData.announcements.slice(0, 3).map((ann, index) => (
              <div key={index} className="announcement-item">
                <span className="announcement-icon">📢</span>
                <div className="announcement-content">
                  <p>{ann.message}</p>
                  <span className="announcement-date">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      {showAnnouncementModal && (
        <div className="modal-overlay" onClick={() => setShowAnnouncementModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Announcement</h2>
            <form onSubmit={handleAddAnnouncement}>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={announcement}
                  onChange={(e) => setAnnouncement(e.target.value)}
                  required
                  rows="4"
                  placeholder="Enter your announcement message..."
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={() => setShowAnnouncementModal(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Post Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OwnerDashboard;