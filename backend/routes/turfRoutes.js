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
  updateCondition
} = require('../controllers/turfController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllTurfs);
router.get('/:id', getTurf);
router.get('/:id/availability', getTurfAvailability);

// Protected routes - Turf Owner or Admin
router.post('/', protect, authorize('turf_owner', 'admin'), createTurf);
router.put('/:id', protect, authorize('turf_owner', 'admin'), updateTurf);
router.delete('/:id', protect, authorize('turf_owner', 'admin'), deleteTurf);
router.post('/:id/announcement', protect, authorize('turf_owner', 'admin'), addAnnouncement);
router.put('/:id/condition', protect, authorize('turf_owner', 'admin'), updateCondition);

module.exports = router;