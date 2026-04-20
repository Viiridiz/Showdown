const express = require('express');
const router = express.Router();
const { addSlot, getTeamSlots, updateSlot, deleteSlot } = require('../controllers/buildSlotController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.get('/team/:teamId', getTeamSlots);

// protected 
router.post('/', authMiddleware, addSlot);
router.patch('/:id', authMiddleware, updateSlot);
router.delete('/:id', authMiddleware, deleteSlot);

module.exports = router;