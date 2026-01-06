// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName') || 'User';
  const userRole = localStorage.getItem('userRole') || '';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/turfs" className="nav-logo">
          TurfNation
        </Link>

        <div className="nav-menu">
          {/* General Navigation */}
          <Link to="/turfs" className="nav-link">Turfs</Link>
          <Link to="/tournaments" className="nav-link">Tournaments</Link>

          {/* 1. TURF OWNER LINKS */}
          {token && userRole === 'turf_owner' && (
            <>
              <Link to="/register-turf" className="nav-link nav-highlight">Register Turf</Link>
              <Link to="/owner-dashboard" className="nav-link">Owner Dashboard</Link>
            </>
          )}

          {/* 2. ADMIN LINKS */}
          {token && userRole === 'admin' && (
            <Link to="/admin-dashboard" className="nav-link">Admin Dashboard</Link>
          )}

          {/* 3. REGULAR USER LINKS */}
          {token && userRole !== 'turf_owner' && userRole !== 'admin' && (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/my-bookings" className="nav-link">My Bookings</Link>
            </>
          )}

          {/* AUTH SECTION */}
          {token ? (
            <div className="nav-user-section">
              <NotificationBell />
              
              <Link to="/profile" className="nav-link nav-profile">
                Hello, {userName}
              </Link>

              <button onClick={handleLogout} className="nav-btn">Logout</button>
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-btn">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;