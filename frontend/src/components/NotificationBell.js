import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NotificationBell.css';

function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem('token');

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await axios.get('http://localhost:5000/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (err) {
      console.error("Notification fetch failed:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  // NEW: Function to open dropdown and clear the badge count
  const toggleDropdown = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    // If opening the menu and there are unread items, clear them in DB
    const unreadCount = notifications.filter(n => !n.isRead).length;
    if (nextState && unreadCount > 0) {
      try {
        await axios.put('http://localhost:5000/api/notifications/mark-all-read', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Update local state so badge disappears immediately without a refresh
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (err) {
        console.error("Error marking all as read:", err);
      }
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notification-container">
      {/* Changed onClick to use the new toggleDropdown function */}
      <div className="bell-wrapper" onClick={toggleDropdown}>
        <span className="bell-icon-styled">🔔</span>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </div>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notifications ({unreadCount})</h3>
            <button onClick={() => setIsOpen(false)}>Close</button>
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="no-notif">No new notifications</p>
            ) : (
              notifications.map(n => (
                <div 
                  key={n._id} 
                  className={`notification-item ${n.isRead ? '' : 'unread'}`}
                  onClick={() => handleMarkAsRead(n._id)}
                >
                  <p>{n.message}</p>
                  <small>{new Date(n.createdAt).toLocaleString()}</small>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;