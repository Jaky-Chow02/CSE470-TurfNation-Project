const express = require('express');
const router = express.Router();
const {
  createTournament,
  getAllTournaments,
  getTournament,
  joinTournament,
  updateTournament
} = require('../controllers/tournamentController');
const { protect } = require('../middleware/auth');

router.get('/', getAllTournaments);
router.get('/:id', getTournament);

router.use(protect);
router.post('/', createTournament);
router.post('/:id/join', joinTournament);
router.put('/:id', updateTournament);

module.exports = router;