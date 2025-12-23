import React from 'react';
<<<<<<< HEAD
import AdminDashboard from './components/AdminDashboard';  // Adjust the import path
=======
>>>>>>> 807244330c9970f556b7fa740fc77469c64b562e
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import Tournaments from './pages/Tournaments';
import TournamentDetails from './pages/TournamentDetails';
import CreateTournament from './pages/CreateTournament';
import Login from './pages/Login';
import Register from './pages/Register';
import TurfList from './pages/TurfList';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';
import UserProfile from './pages/UserProfile';
import ChangePassword from './pages/ChangePassword';

import './App.css';

function App() {
<<<<<<< HEAD
  const isAuthenticated = localStorage.getItem('token'); // Check if user is authenticated
  const userRole = localStorage.getItem('role');  // Assuming role is stored in localStorage
=======
  const token = localStorage.getItem('token');

  const ProtectedRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" />;
  };
>>>>>>> 807244330c9970f556b7fa740fc77469c64b562e

  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container">
          <Routes>
            <Route path="/" element={<Navigate to="/turfs" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/turfs" element={<TurfList />} />
            <Route path="/book/:turfId" element={<ProtectedRoute><BookingPage /></ProtectedRoute>} />
            <Route path="/tournaments/create" element={<ProtectedRoute><CreateTournament /></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/tournaments/:id" element={<TournamentDetails />} />
<<<<<<< HEAD
            <Route 
              path="/dashboard" 
              element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/owner-dashboard" 
              element={isAuthenticated ? <OwnerDashboard /> : <Navigate to="/login" />} 
            />
            {/* Admin Dashboard route with role check */}
            <Route 
              path="/admin-dashboard" 
              element={isAuthenticated && userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} 
            />
=======
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/owner-dashboard" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />

            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/change-password" element={<ChangePassword />} />
>>>>>>> 807244330c9970f556b7fa740fc77469c64b562e
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
