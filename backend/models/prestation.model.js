
const db = require("../db/connection");

// Get all prestations
const getPrestations = async () => {
    const [rows] = await db.query("SELECT * FROM PrestationList");
    return rows;
};

// Create a new prestation
const createPrestation = async (data) => {
    const { prestation_name, prestation_code, specialty_id } = data;
    try {
        const [result] = await db.query(
            "INSERT INTO PrestationList (prestation_name, prestation_code, specialty_id) VALUES (?, ?, ?)",
            [prestation_name, prestation_code, specialty_id]
        );
        return {
            id: result.insertId,
            prestation_name,
            prestation_code,
            specialty_id
        };
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes('prestation_name')) {
                throw new Error('Prestation name already exists.');
            } else if (error.message.includes('prestation_code')) {
                throw new Error('Prestation code already exists.');
            }
        }

        console.error("Error creating prestation:", error);
        throw new Error("Can't create prestation.");
    }
};


// Update a prestation
const updatePrestation = async (prestationId, data) => {
    const { prestation_name, prestation_code, specialty_id } = data;

    try {
        const [result] = await db.query(
            "UPDATE PrestationList SET prestation_name = ?, prestation_code = ?, specialty_id = ? WHERE id = ?",
            [prestation_name, prestation_code, specialty_id, prestationId]
        );

        if (result.affectedRows === 0) {
            return null; // Prestation not found or no changes made
        }

        return {
            id: prestationId,
            prestation_name,
            prestation_code,
            specialty_id
        };
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            if (error.message.includes('prestation_name')) {
                throw new Error('Prestation name already exists.');
            } else if (error.message.includes('prestation_code')) {
                throw new Error('Prestation code already exists.');
            }
        }

        console.error("Error updating prestation:", error);
        throw new Error("Can't update prestation.");
    }
};



// Delete a prestation
const deletePrestation = async (prestationId) => {
    try {
        const [result] = await db.query(
            "DELETE FROM PrestationList WHERE id = ?",
            [prestationId]
        );
        if (result.affectedRows === 0) {
            return null; // Prestation not found
        }
        return {
            message: "Prestation deleted successfully"
        };
    } catch (error) {
        console.error("Error deleting prestation:", error);
        throw new Error("Can't delete prestation");
    }
};


module.exports = {
    getPrestations,
    createPrestation,
    updatePrestation,
    deletePrestation
};
