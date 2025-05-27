const db = require("./../db/connection");

const getAllCompanies = async () => {
    const [rows] = await db.query('SELECT * FROM Company');
    return rows;
};

const createCompany = async (company) => {
    const query = `
        INSERT INTO Company (company_name, address, phone_number, email)
        VALUES (?, ?, ?, ?)
    `;
    const values = [company.company_name, company.address, company.phone_number, company.email];

    try {
        const [result] = await db.query(query, values);
        return {
            ...company,
            id: result.insertId
        };
    } catch (error) {
        console.error("Error inserting company:", error);
        throw error;
    }
};

const updateCompany = async (id, company) => {
    const query = `
        UPDATE Company
        SET company_name = ?, address = ?, phone_number = ?, email = ?
        WHERE id = ?
    `;
    const values = [company.company_name, company.address, company.phone_number, company.email, id];

    try {
        const [result] = await db.query(query, values);

        if (result.affectedRows === 0) {
            throw new Error("Company not found or no changes made.");
        }

        return { ...company, id };
    } catch (error) {
        console.error("Error updating company:", error);
        throw error;
    }
};


module.exports = {
    getAllCompanies,
    createCompany,
    updateCompany
};
