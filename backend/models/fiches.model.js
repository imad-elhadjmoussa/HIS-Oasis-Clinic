const db = require("./../db/connection");


const createFiche = async (fiche) => {
    const query = `
        INSERT INTO MedicalRecord (
            patient_id,
            company_id,
            agreement_id
        ) 
        VALUES (?, ?, ?)
    `;

    const values = [
        fiche.patient_id,
        fiche.company_id,
        fiche.agreement_id,
    ];

    try {
        const [result] = await db.query(query, values);
        return {
            ...fiche,            
            id: result.insertId, // Assuming the database returns the inserted ID
        };
    } catch (error) {
        console.error("Error creating fiche:", error);
        throw error;
    }
};


module.exports = {
    createFiche
};