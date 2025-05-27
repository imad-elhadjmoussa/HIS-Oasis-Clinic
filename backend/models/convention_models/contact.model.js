const db = require("./../../db/connection");

const getContactsByCompanyId = async (companyId) => {
    const query = `SELECT * FROM Contact WHERE company_id = ? `;
    const [rows] = await db.query(query, [companyId]);
    return rows;
};

const addContactToCompany = async (companyId, contact) => {
    const query = `
        INSERT INTO Contact (phone_number, Name, email, job_function, company_id)
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
        contact.phone_number, 
        contact.Name, 
        contact.email,
        contact.job_function || null, // Handle case when job_function is not provided
        companyId
    ];
    
    try {
        const [result] = await db.query(query, values);
        return {
            ...contact,
            id: result.insertId,
            company_id: companyId
        };
    } catch (error) {
        console.error("Error inserting contact:", error);
        throw error;
    }
};

const updateContact = async (contactId, contact) => {
    // First, get the current contact data
    const selectQuery = `SELECT * FROM Contact WHERE id = ?`;
    const [rows] = await db.query(selectQuery, [contactId]);
    
    if (rows.length === 0) {
        return null;
    }
    
    const currentContact = rows[0];
    
    // Prepare update query with all fields
    const query = `
        UPDATE Contact
        SET phone_number = ?, Name = ?, email = ?, job_function = ?
        WHERE id = ?
    `;
    
    // Use current values if new ones are not provided
    const values = [
        contact.phone_number !== undefined ? contact.phone_number : currentContact.phone_number,
        contact.Name !== undefined ? contact.Name : currentContact.Name,
        contact.email !== undefined ? contact.email : currentContact.email,
        contact.job_function !== undefined ? contact.job_function : currentContact.job_function,
        contactId
    ];
    
    try {
        const [result] = await db.query(query, values);
        if (result.affectedRows === 0) {
            throw new Error("Contact not found or no changes made.");
        }
        
        // Return updated contact with all fields
        return {
            id: contactId,
            phone_number: values[0],
            Name: values[1],
            email: values[2],
            job_function: values[3],
            company_id: currentContact.company_id
        };
    } catch (error) {
        console.error("Error updating contact:", error);
        throw error;
    }
};

const deleteContact = async (contactId) => {
    const query = `DELETE FROM Contact WHERE id = ?`;
    try {
        const [result] = await db.query(query, [contactId]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error("Error deleting contact:", error);
        throw error;
    }
};

module.exports = {
    getContactsByCompanyId,
    addContactToCompany,
    updateContact,
    deleteContact
};