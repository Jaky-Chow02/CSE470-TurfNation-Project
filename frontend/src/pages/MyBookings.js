import React, { useState, useEffect } from 'react';
import { getMyBookings, cancelBooking } from '../services/api';
import './MyBookings.css';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await getMyBookings();
      setBookings(response.data.data);
    } catch (err) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(bookingId, 'User requested cancellation');
        fetchBookings();
      } catch (err) {
        alert('Failed to cancel booking');
      }
    }
  };

  if (loading) return <div className="loading">Loading bookings...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="my-bookings-page">
      <h1>My Bookings</h1>

      {bookings.length === 0 ? (
        <p>No bookings found. Book a turf to get started!</p>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => (
            <div key={booking._id} className={`booking-card ${booking.status}`}>
              <div className="booking-header">
                <h3>{booking.turf?.name}</h3>
                <span className={`status-badge ${booking.status}`}>
                  {booking.status}
                </span>
              </div>

              <div className="booking-details">
                <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {booking.startTime} - {booking.endTime}</p>
                <p><strong>Sport:</strong> {booking.sport}</p>
                <p><strong>Duration:</strong> {booking.duration} hours</p>
                <p><strong>Amount:</strong> ₹{booking.payment.amount}</p>
                
                {booking.weather && (
                  <div className="weather-small">
                    <p><strong>Weather:</strong> {booking.weather.condition}, {booking.weather.temperature}°C</p>
                  </div>
                )}
              </div>

              {booking.qrCode && (
                <div className="qr-code">
                  <img src={booking.qrCode} alt="Booking QR Code" />
                  <p>Show this QR code at the venue</p>
                </div>
              )}

              {booking.status === 'confirmed' && (
                <button 
                  onClick={() => handleCancel(booking._id)}
                  className="btn-cancel"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBookings;