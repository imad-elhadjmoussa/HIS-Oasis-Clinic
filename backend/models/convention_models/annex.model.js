const db = require("./../../db/connection");

// Create a new annex
const createAnnex = async (contractId, annexData) => {
    const { annex_name, specialty_id } = annexData;

    // Set 'created_by' to 'manual'
    const created_by = 'manual';

    const [result] = await db.execute(
        `INSERT INTO Annex (annex_name, contract_id, specialty_id, created_by) 
         VALUES (?, ?, ?, ?)`,
        [annex_name, contractId, specialty_id, created_by]
    );

    return {
        id: result.insertId,
        annex_name,
        contract_id: contractId,
        specialty_id,
        created_by, // This will always be 'manual'
    };
};

// Update an existing annex
const updateAnnex = async (annexId, updateData) => {
    const { annex_name, specialty_id } = updateData;

    await db.execute(
        `UPDATE Annex SET annex_name = ?, specialty_id = ? WHERE id = ?`,
        [annex_name, specialty_id, annexId]
    );

    return { id: annexId, annex_name, specialty_id };
};

// Get all annexes for a contract, including the specialty name and created_by
const getAnnexesByContractId = async (contractId) => {
    const [rows] = await db.execute(
        `SELECT
            Annex.id,
            Annex.annex_name,
            Annex.contract_id,
            Annex.specialty_id,
            Specialty.specialty_name,
            DATE_FORMAT(Annex.created_at, '%d/%m/%Y') AS created_at,
            Annex.created_by
         FROM Annex
         JOIN Specialty ON Annex.specialty_id = Specialty.id
         WHERE Annex.contract_id = ?
         ORDER BY Annex.id DESC`,
        [contractId]
    );
    return rows;
};

const getAnnexById = async (annexId) => {
    const [rows] = await db.execute(
        `SELECT 
            Annex.id, 
            Annex.annex_name, 
            Annex.contract_id, 
            Specialty.specialty_name, 
            DATE_FORMAT(Annex.created_at, '%d/%m/%Y %H:%i:%s') AS created_at, 
            Annex.created_by,
            Contract.status AS contract_status
         FROM Annex
         JOIN Specialty ON Annex.specialty_id = Specialty.id
         JOIN Contract ON Annex.contract_id = Contract.id
         WHERE Annex.id = ?`,
        [annexId]
    );

    return rows[0];
};


// Check if an annex has prestations
const hasPrestationsUnderAnnex = async (annexId) => {
    const [rows] = await db.execute(
        `SELECT COUNT(*) AS count FROM PrestationPrice 
         WHERE annex_id = ? AND updated_by_id IS NULL`,
        [annexId]
    );

    return rows[0].count > 0;
};

// Model function to delete an annex and its related prestation prices
const deleteAnnex = async (annexId) => {
    // Using a transaction to ensure data consistency
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // Step 1: Delete related prestation prices first
        await connection.execute(
            'DELETE FROM PrestationPrice WHERE annex_id = ?',
            [annexId]
        );
        
        // Step 2: Delete the annex itself
        const [result] = await connection.execute(
            'DELETE FROM Annex WHERE id = ?',
            [annexId]
        );
        
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};


module.exports = {
    createAnnex,
    updateAnnex,
    getAnnexesByContractId,
    getAnnexById,
    hasPrestationsUnderAnnex,
    deleteAnnex
};
