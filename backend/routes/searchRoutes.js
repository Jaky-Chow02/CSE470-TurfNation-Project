// backend/routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const {
  getSearchSuggestions,
  searchTurfs,
  getPopularSearches,
  searchNearby
} = require('../controllers/searchController');

/**
 * @route   GET /api/search/suggestions
 * @desc    Get autocomplete suggestions
 * @access  Public
 * @query   query (string, min 2 chars)
 * @query   type (optional: 'all', 'turfs', 'locations', 'sports')
 */
router.get('/suggestions', getSearchSuggestions);

/**
 * @route   GET /api/search
 * @desc    Advanced search with filters
 * @access  Public
 * @query   query, location, sportType, date, startTime, endTime, minPrice, maxPrice, sortBy, page, limit
 */
router.get('/', searchTurfs);

/**
 * @route   GET /api/search/popular
 * @desc    Get popular searches (trending)
 * @access  Public
 */
router.get('/popular', getPopularSearches);

/**
 * @route   GET /api/search/nearby
 * @desc    Search turfs near a location
 * @access  Public
 * @query   lat, lon, radius (meters), sportType, limit
 */
router.get('/nearby', searchNearby);

module.exports = router;