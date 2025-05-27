const db = require("../db/connection");

const getModalities = async () => {
    const [rows] = await db.query(`
        SELECT 
            m.id,
            m.modality_name,
            m.created_at,
            p.id AS prestation_list_id,
            p.prestation_name,
            w.id AS waiting_room_id,
            w.room_name
        FROM Modality m
        JOIN PrestationList p ON m.prestation_list_id = p.id
        JOIN WaitingRoom w ON m.waiting_room_id = w.id
    `);
    return rows;
};


const createModality = async (data) => {
    try {
        const { prestation_list_id, waiting_room_id, modality_name } = data;

        const [result] = await db.query(
            "INSERT INTO Modality (prestation_list_id, waiting_room_id, modality_name) VALUES (?, ?, ?)",
            [prestation_list_id, waiting_room_id, modality_name]
        );

        return {
            id: result.insertId,
            prestation_list_id,
            waiting_room_id,
            modality_name
        };
    } catch (error) {
        console.error("Error creating modality:", error);

        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error("Modality name must be unique.");
        }

        throw new Error("Can't create modality");
    }
};

const updateModality = async (modalityId, data) => {
    try {
        const { prestation_list_id, waiting_room_id, modality_name } = data;

        const [result] = await db.query(
            "UPDATE Modality SET prestation_list_id = ?, waiting_room_id = ?, modality_name = ? WHERE id = ?",
            [prestation_list_id, waiting_room_id, modality_name, modalityId]
        );

        if (result.affectedRows === 0) {
            return null; // Modality not found or unchanged
        }

        return {
            id: modalityId,
            prestation_list_id,
            waiting_room_id,
            modality_name
        };
    } catch (error) {
        console.error("Error updating modality:", error);

        if (error.code === 'ER_DUP_ENTRY') {
            throw new Error("Modality name must be unique.");
        }

        throw new Error("Can't update modality");
    }
};

const deleteModality = async (modalityId) => {
    try {
        const [result] = await db.query(
            "DELETE FROM Modality WHERE id = ?",
            [modalityId]
        );

        if (result.affectedRows === 0) {
            return null; // Not found
        }

        return {
            message: "Modality deleted successfully"
        };
    } catch (error) {
        console.error("Error deleting modality:", error);
        throw new Error("Can't delete modality");
    }
};

const getModalityDetails = async (modalityId) => {
    const [rows] = await db.query(
        `SELECT 
            m.id AS modality_id,
            m.modality_name,
            m.created_at,

            p.id AS prestation_id,
            p.prestation_name,
            p.prestation_code,

            w.id AS room_id,
            w.room_name,
            w.number

        FROM Modality m
        LEFT JOIN PrestationList p ON p.id = m.prestation_list_id
        LEFT JOIN WaitingRoom w ON w.id = m.waiting_room_id
        WHERE m.id = ?`,
        [modalityId]
    );

    if (rows.length === 0) return null;

    const row = rows[0];
    return {
        modality_id: row.modality_id,
        modality_name: row.modality_name,
        created_at: row.created_at,
        prestation: {
            prestation_id: row.prestation_id,
            prestation_name: row.prestation_name,
            prestation_code: row.prestation_code
        },
        waiting_room: {
            room_id: row.room_id,
            room_name: row.room_name,
            number: row.number
        }
    };
};

module.exports = {
    getModalities,
    createModality,
    updateModality,
    deleteModality,
    getModalityDetails
};
