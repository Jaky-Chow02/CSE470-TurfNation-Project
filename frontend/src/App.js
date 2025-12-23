import React from 'react';
import AdminDashboard from './components/AdminDashboard';  // Adjust the import path
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import OwnerDashboard from './pages/OwnerDashboard';

import Navbar from './components/Navbar';
import Tournaments from './pages/Tournaments';
import TournamentDetails from './pages/TournamentDetails';
import CreateTournament from './pages/CreateTournament';
import Login from './pages/Login';
import Register from './pages/Register';
import TurfList from './pages/TurfList';
import BookingPage from './pages/BookingPage';
import MyBookings from './pages/MyBookings';
import './App.css';

function App() {
  const isAuthenticated = localStorage.getItem('token'); // Check if user is authenticated
  const userRole = localStorage.getItem('role');  // Assuming role is stored in localStorage

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
            <Route 
              path="/book/:turfId" 
              element={isAuthenticated ? <BookingPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/tournaments/create" 
              element={isAuthenticated ? <CreateTournament /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/my-bookings" 
              element={isAuthenticated ? <MyBookings /> : <Navigate to="/login" />} 
            />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/tournaments/:id" element={<TournamentDetails />} />
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
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
