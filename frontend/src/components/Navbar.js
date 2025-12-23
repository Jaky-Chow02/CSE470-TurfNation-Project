import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token'); // Check if user is logged in
  const userName = localStorage.getItem('userName'); // Get the user's name
  const userRole = localStorage.getItem('userRole'); // Get the user's role (admin, turf_owner, etc.)

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole'); // Remove user role when logging out
    navigate('/login'); // Redirect to login page
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/turfs" className="nav-logo">
          TurfNation
        </Link>
        
        <div className="nav-menu">
          <Link to="/turfs" className="nav-link">Turfs</Link>
          <Link to="/tournaments" className="nav-link">Tournaments</Link>
          
          {/* Conditional link for Turf Owner Dashboard */}
          {token && userRole === 'turf_owner' && (
            <Link to="/owner-dashboard" className="nav-link">Owner Dashboard</Link>
          )}

          {/* Conditional link for Admin Dashboard */}
          {token && userRole === 'admin' && (
            <Link to="/admin-dashboard" className="nav-link admin-dashboard">Admin Dashboard</Link>
          )}
          
          {/* Show these links if the user is authenticated */}
          {token ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/my-bookings" className="nav-link">My Bookings</Link>
              
              <span className="nav-user">Hello, {userName}</span>

              {/* Logout Button */}
              <button onClick={handleLogout} className="nav-btn">Logout</button>
            </>
          ) : (
            <>
              {/* If not authenticated, show login and register links */}
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
