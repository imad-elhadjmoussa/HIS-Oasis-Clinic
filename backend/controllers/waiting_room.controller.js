const waitingRoomModel = require('../models/waiting_room.model');

const getWaitingRooms = async (req, res) => {
    try {
        const rooms = await waitingRoomModel.getWaitingRooms();
        res.status(200).json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const createWaitingRoom = async (req, res) => {
    try {
        const newRoom = await waitingRoomModel.createWaitingRoom(req.body);
        res.status(201).json({
            room: newRoom,
            message: 'Waiting room created successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

const updateWaitingRoom = async (req, res) => {
    const roomId = req.params.id;
    try {
        const updatedRoom = await waitingRoomModel.updateWaitingRoom(roomId, req.body);
        if (!updatedRoom) {
            return res.status(404).json({ message: 'Waiting room not found' });
        }
        res.status(200).json({
            room: updatedRoom,
            message: 'Waiting room updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

const deleteWaitingRoom = async (req, res) => {
    const roomId = req.params.id;
    try {
        const deleted = await waitingRoomModel.deleteWaitingRoom(roomId);
        if (!deleted) {
            return res.status(404).json({ message: 'Waiting room not found' });
        }
        res.status(200).json({ message: 'Waiting room deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};

const getWaitingRoomDetails = async (req, res) => {
    const roomId = req.params.id;
    try {
        const room = await waitingRoomModel.getWaitingRoomDetails(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Waiting room not found' });
        }
        res.status(200).json(room);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getWaitingRooms,
    createWaitingRoom,
    updateWaitingRoom,
    deleteWaitingRoom,
    getWaitingRoomDetails
};
