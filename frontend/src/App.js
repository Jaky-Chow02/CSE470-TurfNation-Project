// src/App.js
import React from 'react';
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
import AdminDashboard from './components/AdminDashboard';

import './App.css';

function App() {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole') || '';  // ← Fixed: use 'userRole'

  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (!token) return <Navigate to="/login" />;
    if (adminOnly && userRole !== 'admin') return <Navigate to="/dashboard" />;
    return children;
  };

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
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/owner-dashboard" element={<ProtectedRoute><OwnerDashboard /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route 
              path="/admin-dashboard" 
              element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;