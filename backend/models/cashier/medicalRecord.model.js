const db = require('../../db/connection');

const getFicheById = async (id) => {
    const [rows] = await db.query('SELECT * FROM medicalrecord WHERE id = ?', [id]);
    return rows[0];
};

const getUnbilledFiches = async () => {
    const [rows] = await db.query('SELECT * FROM medicalrecord WHERE status = "unbilled"');
    return rows;
};

module.exports = {
    getFicheById,
    getUnbilledFiches
};
