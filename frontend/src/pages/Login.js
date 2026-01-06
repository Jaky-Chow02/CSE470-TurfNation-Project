// src/pages/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import './Auth.css';

// 1. Add { onLoginSuccess } as a prop
function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(formData);
      const { token, user } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userRole', user.role); 
      localStorage.setItem('userEmail', user.email);

      // 2. Trigger the refresh in App.js before navigating
      if (onLoginSuccess) {
        onLoginSuccess();
      }

      // 3. Conditional Navigation: Admins should go straight to the Admin Dashboard
      if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else if (user.role === 'turf_owner') {
        navigate('/owner-dashboard');
      } else {
        navigate('/turfs');
      }
      
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login to TurfNation</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;