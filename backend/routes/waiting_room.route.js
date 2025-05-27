const express = require('express');
const router = express.Router();
const waitingRoomController = require('../controllers/waiting_room.controller');

// GET /api/waiting-rooms - Get all waiting rooms
router.get('/', waitingRoomController.getWaitingRooms);

// POST /api/waiting-rooms - Create a new waiting room
router.post('/', waitingRoomController.createWaitingRoom);

// PUT /api/waiting-rooms/:id - Update a waiting room
router.put('/:id', waitingRoomController.updateWaitingRoom);

// DELETE /api/waiting-rooms/:id - Delete a waiting room
router.delete('/:id', waitingRoomController.deleteWaitingRoom);

// GET /api/waiting-rooms/:id - Get details of a specific waiting room
router.get('/:id', waitingRoomController.getWaitingRoomDetails);

module.exports = router;
