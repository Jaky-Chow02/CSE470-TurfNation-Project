const express = require('express');
const router = express.Router();
const {
  createTurf,
  getAllTurfs,
  getTurf,
  updateTurf,
  deleteTurf,
  getTurfAvailability,
  addAnnouncement,
  updateCondition,
  approveTurf,
  getOwnerTurfs
} = require('../controllers/turfController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// --- 1. STATIC & SPECIFIC ROUTES (MUST come before /:id) ---

// Get turfs owned by logged-in turf owner
router.get('/my-turfs', protect, authorize('turf_owner'), getOwnerTurfs);

// Admin Approval - Specific path must be above generic /:id to prevent 404
router.put('/:id/approve', protect, authorize('admin'), approveTurf);

// Availability (Public)
router.get('/:id/availability', getTurfAvailability);

// Announcements & Conditions (Protected)
router.post('/:id/announcement', protect, authorize('turf_owner', 'admin'), addAnnouncement);
router.put('/:id/condition', protect, authorize('turf_owner', 'admin'), updateCondition);


// --- 2. DYNAMIC ID ROUTES ---

// Public single turf view
router.get('/:id', getTurf);

// Update and Delete
router.put('/:id', protect, authorize('turf_owner', 'admin'), updateTurf);
router.delete('/:id', protect, authorize('turf_owner', 'admin'), deleteTurf);


// --- 3. BASE ROUTES ---

/** * UPDATED: Use optionalAuth here. 
 * This allows the controller to see if an Admin is logged in 
 * so it can show pending requests in the Admin Dashboard.
 */
router.get('/', optionalAuth, getAllTurfs);

// Create new turf request
router.post('/', protect, authorize('turf_owner', 'admin'), createTurf);

module.exports = router;