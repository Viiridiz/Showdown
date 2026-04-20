const express = require('express');
const router = express.Router();
const { createTeam, getTeams, updateTeam, deleteTeam, upvoteTeam } = require('../controllers/teamController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// anyone can view the public feed, no auth needed
router.get('/', getTeams);

router.post('/', authMiddleware, createTeam);
router.patch('/:id', authMiddleware, updateTeam);
router.delete('/:id', authMiddleware, deleteTeam);
router.patch('/:id/upvote', authMiddleware, upvoteTeam);

module.exports = router;