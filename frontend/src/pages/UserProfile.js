import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '../services/api';
import './UserProfile.css';

function UserProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUserData = () => {
      const name = localStorage.getItem('userName') || 'User';
      const email = localStorage.getItem('userEmail') || '';
      const phone = localStorage.getItem('userPhone') || '';

      setProfile({ name, email, phone });
      setLoading(false);
    };

    loadUserData();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setUpdating(true);

    try {
      const response = await updateProfile({
        name: profile.name.trim(),
        phone: profile.phone || undefined,
      });

      const updatedUser = response.data.user;


      localStorage.setItem('userName', updatedUser.name);
      localStorage.setItem('userPhone', updatedUser.phone || '');

      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>My Profile</h1>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleUpdate} className="profile-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={profile.email || 'Email not set'}
              disabled
              className="disabled-input"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="Enter your phone number"
            />
          </div>

          <button type="submit" disabled={updating} className="btn-primary">
            {updating ? 'Updating...' : 'Update Profile'}
          </button>
        </form>

        <div className="section-divider"></div>


        <button
          onClick={() => navigate('/change-password')}
          className="btn-secondary"
        >
          Change Password
        </button>
      </div>
    </div>
  );
}

export default UserProfile;