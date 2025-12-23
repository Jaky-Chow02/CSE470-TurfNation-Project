import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  const navigate = useNavigate();
<<<<<<< HEAD
  const token = localStorage.getItem('token'); // Check if user is logged in
  const userName = localStorage.getItem('userName'); // Get the user's name
  const userRole = localStorage.getItem('userRole'); // Get the user's role (admin, turf_owner, etc.)
=======
  const token = localStorage.getItem('token');
  const userName = localStorage.getItem('userName') || 'User';
  const userRole = localStorage.getItem('userRole');
>>>>>>> 807244330c9970f556b7fa740fc77469c64b562e

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
<<<<<<< HEAD
    localStorage.removeItem('userRole'); // Remove user role when logging out
    navigate('/login'); // Redirect to login page
=======
    localStorage.removeItem('userRole');
    navigate('/login');
>>>>>>> 807244330c9970f556b7fa740fc77469c64b562e
  };


  const isOwner = userRole && ['turf_owner', 'owner', 'Turf_Owner'].includes(userRole);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/turfs" className="nav-logo">
          TurfNation
        </Link>

        <div className="nav-menu">
          <Link to="/turfs" className="nav-link">Turfs</Link>
          <Link to="/tournaments" className="nav-link">Tournaments</Link>
<<<<<<< HEAD
          
          {/* Conditional link for Turf Owner Dashboard */}
          {token && userRole === 'turf_owner' && (
            <Link to="/owner-dashboard" className="nav-link">Owner Dashboard</Link>
          )}

          {/* Conditional link for Admin Dashboard */}
          {token && userRole === 'admin' && (
            <Link to="/admin-dashboard" className="nav-link admin-dashboard">Admin Dashboard</Link>
          )}
          
          {/* Show these links if the user is authenticated */}
=======

          {/* Owner Dashboard - visible only to turf owners */}
          {token && isOwner && (
            <Link to="/owner-dashboard" className="nav-link">Owner Dashboard</Link>
          )}

>>>>>>> 807244330c9970f556b7fa740fc77469c64b562e
          {token ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <Link to="/my-bookings" className="nav-link">My Bookings</Link>
              
              {/* Clickable username that goes to Profile */}
              <Link to="/profile" className="nav-link">
                Hello, {userName}
              </Link>

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
