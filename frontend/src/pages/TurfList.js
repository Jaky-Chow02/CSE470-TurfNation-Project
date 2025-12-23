import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllTurfs } from '../services/api';
import './TurfList.css';

function TurfList() {
  const [turfs, setTurfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTurfs();
  }, []);

  const fetchTurfs = async (city = '') => {
    try {
      setLoading(true);
      const params = city ? { city } : {};
      const response = await getAllTurfs(params);
      setTurfs(response.data.data);
    } catch (err) {
      setError('Failed to load turfs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTurfs(searchCity);
  };

  const handleBook = (turfId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      navigate(`/book/${turfId}`);
    }
  };

  if (loading) return <div className="loading">Loading turfs...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="turf-list-page">
      <h1>Available Turfs</h1>
      
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search by city (e.g., Dhaka)"
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="btn-search">Search</button>
        <button type="button" onClick={() => { setSearchCity(''); fetchTurfs(); }} className="btn-reset">
          Clear
        </button>
      </form>

      <div className="turf-grid">
        {turfs.length === 0 ? (
          <p>No turfs found. Try a different city.</p>
        ) : (
          turfs.map((turf) => (
            <div key={turf._id} className="turf-card">
              <h3>{turf.name}</h3>
              <p className="turf-location">
                {turf.location.address}, {turf.location.city}
              </p>
              <p className="turf-price">₹{turf.pricePerHour}/hour</p>
              <div className="turf-sports">
                {turf.sports.map((sport, idx) => (
                  <span key={idx} className="sport-tag">{sport}</span>
                ))}
              </div>
              <p className="turf-condition">Condition: {turf.condition}</p>
              <button 
                onClick={() => handleBook(turf._id)} 
                className="btn-book"
              >
                Book Now
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TurfList;