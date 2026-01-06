import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './RegisterTurf.css';

function RegisterTurf() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pricePerHour: '',
    location: { address: '', city: '' },
    sports: [],
    facilities: []
  });

  const availableSports = ['Football', 'Cricket', 'Badminton', 'Tennis', 'Basketball', 'Volleyball'];
  const availableFacilities = ['Parking', 'Washroom', 'Changing Room', 'Drinking Water', 'Lighting'];

  const handleCheckboxChange = (field, value) => {
    const updated = formData[field].includes(value)
      ? formData[field].filter(i => i !== value)
      : [...formData[field], value];
    setFormData({ ...formData, [field]: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      };
      await axios.post('http://localhost:5000/api/turfs', formData, config);
      toast.success('Registration request submitted successfully!');
      navigate('/owner-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>Register New Turf</h1>
        <p className="subtitle">Submit your turf details for admin approval</p>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Turf Name</label>
            <input
              type="text"
              placeholder="e.g. Dream Arena"
              required
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label>Price Per Hour (BDT)</label>
              <input
                type="number"
                placeholder="1200"
                required
                onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                placeholder="Dhaka"
                required
                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Detailed Address</label>
            <input
              type="text"
              placeholder="Area, Street, Sector..."
              required
              onChange={(e) => setFormData({ ...formData, location: { ...formData.location, address: e.target.value } })}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              className="custom-textarea"
              rows="3"
              placeholder="Tell us about your turf..."
              required
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <div className="section-divider"></div>

          <div className="checkbox-section">
            <label className="section-label">Sports Supported</label>
            <div className="checkbox-grid">
              {availableSports.map(sport => (
                <label key={sport} className="checkbox-item">
                  <input type="checkbox" onChange={() => handleCheckboxChange('sports', sport)} />
                  <span>{sport}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="checkbox-section">
            <label className="section-label">Facilities</label>
            <div className="checkbox-grid">
              {availableFacilities.map(fac => (
                <label key={fac} className="checkbox-item">
                  <input type="checkbox" onChange={() => handleCheckboxChange('facilities', fac)} />
                  <span>{fac}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Submitting...' : 'Submit for Approval'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterTurf;