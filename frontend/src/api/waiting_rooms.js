import axios from 'axios';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const waitingRooms = axios.create({
    baseURL: `${SERVER_URL}/api/waiting-rooms`,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const getWaitingRooms = async () => {
    try {
        const response = await waitingRooms.get('/');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch specialties');
    }
};


export const createWaitingRoom = async (waitingRoomData) => {
    try {
        const response = await waitingRooms.post('/', waitingRoomData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create waiting room');
    }
};

export const updateWaitingRoom = async (waitingRoomId, waitingRoomData) => {
    try {
        const response = await waitingRooms.put(`/${waitingRoomId}`, waitingRoomData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || `Failed to update waiting room ${waitingRoomId}`);
    }
};

export const deleteWaitingRoom = async (waitingRoomId) => {
    try {
        const response = await waitingRooms.delete(`/${waitingRoomId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || `Failed to delete waiting room ${waitingRoomId}`);
    }
};