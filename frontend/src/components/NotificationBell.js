import React, { useState } from 'react';
import './NotificationBell.css';

function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Your booking is confirmed!", isRead: false },
    { id: 2, message: "Welcome to TurfNation!", isRead: true }
  ]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notification-container">
      <div className="bell-wrapper" onClick={() => setIsOpen(!isOpen)}>
        {/* Using a modern icon character that fits the theme better than an emoji */}
        <span className="bell-icon-styled">🔔</span>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </div>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            <button onClick={() => setIsOpen(false)}>Close</button>
          </div>
          <div className="notification-list">
            {notifications.map(n => (
              <div key={n.id} className={`notification-item ${n.isRead ? '' : 'unread'}`}>
                <p>{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;