import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTurf, createBooking, getWeather } from '../services/api';
import './BookingPage.css';

function BookingPage() {
  const { turfId } = useParams();
  const navigate = useNavigate();
  const [turf, setTurf] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    date: '',
    startTime: '',
    endTime: '',
    sport: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchTurf();
  }, [turfId]);

  const fetchTurf = async () => {
    try {
      const response = await getTurf(turfId);
      setTurf(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load turf details');
      setLoading(false);
    }
  };

  const fetchWeatherData = async (city) => {
    try {
      const response = await getWeather(city);
      setWeather(response.data.data);
    } catch (err) {
      console.error('Weather fetch failed');
    }
  };

  const handleChange = (e) => {
    setBookingData({ ...bookingData, [e.target.name]: e.target.value });
    
    if (e.target.name === 'date' && turf) {
      fetchWeatherData(turf.location.city);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await createBooking({
        turf: turfId,
        ...bookingData
      });
      setSuccess(true);
      setTimeout(() => navigate('/my-bookings'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!turf) return <div className="error">Turf not found</div>;

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="turf-info">
          <h2>{turf.name}</h2>
          <p>{turf.location.address}, {turf.location.city}</p>
          <p className="price">₹{turf.pricePerHour} per hour</p>
          <p>Condition: {turf.condition}</p>
        </div>

        {weather && (
          <div className="weather-info">
            <h3>Weather Forecast</h3>
            <p>Condition: {weather.condition}</p>
            <p>Temperature: {weather.temperature}°C</p>
            <p>Rain Chance: {weather.rainChance}%</p>
            {weather.rainChance > 60 && (
              <p className="weather-warning">High chance of rain. Consider rescheduling.</p>
            )}
          </div>
        )}

        {success && (
          <div className="success-message">
            Booking successful! Redirecting to your bookings...
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={bookingData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                name="startTime"
                value={bookingData.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                name="endTime"
                value={bookingData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Sport</label>
            <select
              name="sport"
              value={bookingData.sport}
              onChange={handleChange}
              required
            >
              <option value="">Select a sport</option>
              {turf.sports.map((sport, idx) => (
                <option key={idx} value={sport}>{sport}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Notes (Optional)</label>
            <textarea
              name="notes"
              value={bookingData.notes}
              onChange={handleChange}
              placeholder="Any special requirements?"
              rows="3"
            />
          </div>

          <button type="submit" className="btn-primary">
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
}

export default BookingPage;