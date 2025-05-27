const db = require('./../../db/connection');

// Get specialties NOT linked to the given contract via Annex
const getAllSpecialties = async (contractId) => {
    const query = `
        SELECT id, specialty_name FROM Specialty
        WHERE id NOT IN (
            SELECT specialty_id FROM Annex WHERE contract_id = ?
        )
    `;
    const [rows] = await db.execute(query, [contractId]);
    return rows;
};

module.exports = {
    getAllSpecialties,
};
