import React, { useState, useEffect } from 'react';
import './AdminDashboard.css'; // Import the CSS for styling

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeTurfs: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/stats');
        const data = await response.json();
        setMetrics(data.data); // Assuming the data structure from backend
        setRecentBookings(data.data.recentBookings);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="metrics">
        <div className="card">
          <h2>Total Users</h2>
          <p>{metrics.totalUsers}</p>
        </div>
        <div className="card">
          <h2>Total Bookings</h2>
          <p>{metrics.totalBookings}</p>
        </div>
        <div className="card">
          <h2>Total Revenue</h2>
          <p>${metrics.totalRevenue}</p>
        </div>
        <div className="card">
          <h2>Active Turfs</h2>
          <p>{metrics.activeTurfs}</p>
        </div>
      </div>

      <h3>Recent Bookings</h3>
      <ul>
        {recentBookings.map((booking, index) => (
          <li key={index}>
            <strong>{booking.user.name}</strong> booked <em>{booking.turf.name}</em> on {booking.createdAt}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
