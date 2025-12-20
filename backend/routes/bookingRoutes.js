const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  rescheduleBooking,
  getTurfBookings
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

// All booking routes require authentication
router.use(protect);

// User routes
router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBooking);
router.put('/:id/cancel', cancelBooking);
router.put('/:id/reschedule', rescheduleBooking);

// Turf owner routes
router.get('/turf/:turfId', authorize('turf_owner', 'admin'), getTurfBookings);

module.exports = router;