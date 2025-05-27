const db = require('./../../db/connection');


const getAgreementDetailsByContractId = async (contract_id) => {
    const query = `
        SELECT * FROM AgreementDetails
        WHERE contract_id = ? AND updated_by_id IS NULL
    `;
    const [rows] = await db.query(query, [contract_id]);
    return rows;
};

const getAgreementDetailsByAvenantId = async (avenant_id) => {
    const query = `
        SELECT * FROM AgreementDetails
        WHERE avenant_id = ?
    `;
    const [rows] = await db.query(query, [avenant_id]);
    return rows;
};

const getById = async (id) => {
    const query = `SELECT * FROM AgreementDetails WHERE id = ?`;
    const [rows] = await db.query(query, [id]);
    return rows[0]; // return the object or undefined
};

// Match: updateAgreementDetail
const updateAgreementDetail = async (id, data) => {
    const query = `
        UPDATE AgreementDetails SET
            start_date = ?,
            end_date = ?,
            family_auth = ?,
            max_price = ?,
            min_price = ?,
            discount_percentage = ?,
            avenant_id = ?
        WHERE id = ?
    `;

    const values = [
        data.start_date,
        data.end_date,
        data.family_auth,
        data.max_price,
        data.min_price,
        data.discount_percentage,
        (!data.avenant_id || data.avenant_id === 'null') ? null : data.avenant_id,
        id
    ];

    const [result] = await db.query(query, values);
    return { ...data, id };
};




module.exports = {
    getAgreementDetailsByContractId,
    getById,
    updateAgreementDetail,
    getAgreementDetailsByAvenantId
};
