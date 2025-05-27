const db = require("../db/connection");

const getWaitingRooms = async () => {
    const [rows] = await db.query("SELECT * FROM WaitingRoom");
    return rows;
};

const createWaitingRoom = async (data) => {
    try {
        const { room_name, number, capacity, filled_places } = data;
        const [result] = await db.query(
            "INSERT INTO WaitingRoom (room_name, number, capacity, filled_places) VALUES (?, ?, ?, ?)",
            [room_name, number || null, capacity || 0, filled_places || 0]
        );

        return {
            id: result.insertId,
            room_name,
            number,
            capacity: capacity || 0,
            filled_places: filled_places || 0
        };
    } catch (error) {
        console.error("Error creating waiting room:", error);

        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error(`Room name "${data.room_name}" already exists.`);
        }

        throw new Error("Can't create waiting room");
    }
};


const updateWaitingRoom = async (roomId, data) => {
    try {
        const { room_name, number, capacity, filled_places } = data;
        const [result] = await db.query(
            "UPDATE WaitingRoom SET room_name = ?, number = ?, capacity = ?, filled_places = ? WHERE id = ?",
            [room_name, number || null, capacity || 0, filled_places || 0, roomId]
        );

        if (result.affectedRows === 0) {
            return null; // Room not found or unchanged
        }

        return {
            id: roomId,
            room_name,
            number,
            capacity,
            filled_places
        };
    } catch (error) {
        console.error("Error updating waiting room:", error);

        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error(`Room name "${data.room_name}" already exists.`);
        }

        throw new Error("Can't update waiting room");
    }
};



const deleteWaitingRoom = async (roomId) => {
    try {
        const [result] = await db.query(
            "DELETE FROM WaitingRoom WHERE id = ?",
            [roomId]
        );

        if (result.affectedRows === 0) {
            return null; // Not found
        }

        return {
            message: "Waiting room deleted successfully"
        };
    } catch (error) {
        console.error("Error deleting waiting room:", error);
        throw new Error("Can't delete waiting room");
    }
};

const getWaitingRoomDetails = async (roomId) => {
    const [rows] = await db.query(
        "SELECT * FROM WaitingRoom WHERE id = ?",
        [roomId]
    );

    if (rows.length === 0) return null;

    return rows[0];
};

module.exports = {
    getWaitingRooms,
    createWaitingRoom,
    updateWaitingRoom,
    deleteWaitingRoom,
    getWaitingRoomDetails
};
