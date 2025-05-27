// Model updates
const db = require('../../db/connection');

const createAgreement = async (contractId, description, title) => {
    const query = `
        INSERT INTO Agreement (description, title, contract_id)
        VALUES (?, ?, ?)
    `;
    const values = [description, title, contractId];
    try {
        const [result] = await db.query(query, values);
        return {
            id: result.insertId,
            description,
            title,
            contract_id: contractId
        };
    } catch (error) {
        console.error("Error creating agreement:", error);
        throw error;
    }
};

const deleteAgreement = async (agreementId) => {
    const query = `DELETE FROM Agreement WHERE id = ?`;
    try {
        const [result] = await db.query(query, [agreementId]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error deleting agreement:", error);
        throw error;
    }
};

const updateAgreement = async (agreementId, description, title) => {
    const query = `
        UPDATE Agreement
        SET description = ?, title = ?
        WHERE id = ?
    `;
    const values = [description, title, agreementId];
    try {
        const [result] = await db.query(query, values);
        if (result.affectedRows === 0) {
            return null;
        }
        return { id: agreementId, description, title };
    } catch (error) {
        console.error("Error updating agreement:", error);
        throw error;
    }
};

const getAgreementById = async (agreementId) => {
    try {
        const [rows] = await db.query(`SELECT * FROM Agreement WHERE id = ?`, [agreementId]);
        return rows[0];
    } catch (error) {
        console.error("Error fetching agreement:", error);
        throw error;
    }
};

const getAgreementsByContractId = async (contractId) => {
    try {
        const [rows] = await db.query(
            `SELECT * FROM Agreement WHERE contract_id = ? ORDER BY id DESC`,
            [contractId]
        );
        return rows;
    } catch (error) {
        console.error("Error fetching agreements by contract ID:", error);
        throw error;
    }
};

module.exports = {
    createAgreement,
    deleteAgreement,
    updateAgreement,
    getAgreementById,
    getAgreementsByContractId
};