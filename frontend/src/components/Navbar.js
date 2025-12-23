import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName');
  const userRole = localStorage.getItem('userRole');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    navigate('/login');
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
          
          {token && userRole === 'turf_owner' && (
              <Link to="/owner-dashboard" className="nav-link">Owner Dashboard</Link>
          )}
          
          
          {token ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>

              <Link to="/my-bookings" className="nav-link">My Bookings</Link>
              
              <span className="nav-user">Hello, {userName}</span>

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