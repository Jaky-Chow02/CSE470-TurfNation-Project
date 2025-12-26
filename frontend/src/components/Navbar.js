// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

  const isOwner = userRole === 'turf_owner';
  const isAdmin = userRole === 'admin';

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/turfs" className="nav-logo">
          TurfNation
        </Link>

        <div className="nav-menu">
          <Link to="/turfs" className="nav-link">Turfs</Link>
          <Link to="/tournaments" className="nav-link">Tournaments</Link>

          {token && isOwner && (
            <Link to="/owner-dashboard" className="nav-link">Owner Dashboard</Link>
          )}

          {token && isAdmin && (
            <Link to="/admin-dashboard" className="nav-link">Admin Dashboard</Link>
          )}

          {token ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/my-bookings" className="nav-link">My Bookings</Link>
              <Link to="/profile" className="nav-link">Hello, {userName}</Link>
              <button onClick={handleLogout} className="nav-btn">Logout</button>
            </>
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