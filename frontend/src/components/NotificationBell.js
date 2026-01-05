import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './NotificationBell.css';

function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem('token');

  // URL setup - using localhost as per your current configuration
  const API_URL = 'http://localhost:5000/api/notifications';

  const fetchNotifications = async () => {
    try {
      const currentToken = localStorage.getItem('token');
      if (!currentToken) return;

      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      
      // Standardizing data format regardless of backend structure
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      setNotifications(data);
    } catch (err) {
      console.error("Notification fetch failed:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
      // Polling every 30 seconds to simulate real-time updates
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [token]);

  const toggleDropdown = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    // When the user opens the bell, mark all as read automatically
    if (nextState && unreadCount > 0) {
      try {
        await axios.put(`${API_URL}/mark-all-read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Optimistic UI update: make badge disappear instantly
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (err) {
        console.error("Error marking all as read:", err);
      }
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Error marking single notification as read:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notification-container">
      <div className="bell-wrapper" onClick={toggleDropdown}>
        <span className="bell-icon-styled" role="img" aria-label="notifications">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            <button className="close-btn" onClick={() => setIsOpen(false)}>&times;</button>
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notif">
                <p>All caught up! 🎉</p>
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n._id} 
                  className={`notification-item ${n.isRead ? 'read' : 'unread'}`}
                  onClick={() => handleMarkAsRead(n._id)}
                >
                  <div className="notif-content">
                    <p className="notif-message">{n.message}</p>
                    <small className="notif-time">
                      {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </small>
                  </div>
                  {!n.isRead && <span className="unread-dot"></span>}
                </div>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <div className="dropdown-footer">
              <small>Showing recent updates</small>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;