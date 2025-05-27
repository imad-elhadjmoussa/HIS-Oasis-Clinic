const db = require('./../../db/connection');

// Add a prestation
const addPrestation = async (annexId, price, patient_part, tva, updated_by_id, prestation_list_id, avenant_id, head) => {
    const query = `
        INSERT INTO PrestationPrice 
        (price, patient_part, tva, updated_by_id, annex_id, prestation_list_id, avenant_id, head)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.execute(query, [price, patient_part, tva, updated_by_id, annexId, prestation_list_id, avenant_id, head]);

    // Return the new record's ID after insertion
    return { id: result.insertId, price, patient_part, tva, updated_by_id, annex_id: annexId, prestation_list_id, avenant_id, head };
};

const addPrestationInAvenant = async (
    annex_id,  // Optional - might be undefined from controller
    price,
    patient_part,
    tva,
    updated_by_id,
    prestation_list_id,
    avenant_id,
    head
) => {
    try {
        // 1. Get the specialty_id from the prestation_list
        const [prestationRow] = await db.execute(
            `SELECT specialty_id FROM PrestationList WHERE id = ?`,
            [prestation_list_id]
        );
        
        if (prestationRow.length === 0) throw new Error("Prestation not found");
        const specialty_id = prestationRow[0].specialty_id;
        
        // 2. Get the contract_id from the avenant
        const [avenantRow] = await db.execute(
            `SELECT contract_id FROM Avenant WHERE id = ?`,
            [avenant_id]
        );
        
        if (avenantRow.length === 0) throw new Error("Avenant not found");
        const contract_id = avenantRow[0].contract_id;
        
        // 3. Check if annex with same specialty and contract exists
        let actualAnnexId = annex_id; // Use provided annex_id if available
        
        if (!actualAnnexId) {
            const [annexRows] = await db.execute(
                `SELECT id FROM Annex WHERE specialty_id = ? AND contract_id = ?`,
                [specialty_id, contract_id]
            );
            
            if (annexRows.length > 0) {
                // Use existing annex
                actualAnnexId = annexRows[0].id;
            } else {
                // 4. Create annex
                const [specialtyRow] = await db.execute(
                    `SELECT specialty_name FROM Specialty WHERE id = ?`,
                    [specialty_id]
                );
                
                if (specialtyRow.length === 0) throw new Error("Specialty not found");
                const annex_name = `Annex ${specialtyRow[0].specialty_name}`;
                
                const [newAnnex] = await db.execute(
                    `INSERT INTO Annex (annex_name, contract_id, specialty_id, created_by) VALUES (?, ?, ?, 'avenant')`,
                    [annex_name, contract_id, specialty_id]
                );
                
                actualAnnexId = newAnnex.insertId;
            }
        }
        
        // 5. Insert the prestation price
        const [result] = await db.execute(
            `INSERT INTO PrestationPrice
          (price, patient_part, tva, updated_by_id, annex_id, prestation_list_id, avenant_id, head, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [price, patient_part, tva, updated_by_id, actualAnnexId, prestation_list_id, avenant_id, head]
        );
        
        return {
            id: result.insertId,
            price,
            patient_part,
            tva,
            updated_by_id,
            annex_id: actualAnnexId,
            prestation_list_id,
            avenant_id,
            head,
        };
    } catch (error) {
        console.error('Model error in addPrestationInAvenant:', error);
        throw error; // Re-throw to be handled by controller
    }
};


// Get all prestations for a specific annex
const getPrestationByAnnexId = async (annexId) => {
    const query = `
        SELECT PrestationPrice.id, PrestationPrice.price, PrestationPrice.patient_part, PrestationPrice.tva,
        PrestationPrice.prestation_list_id, PrestationPrice.avenant_id, PrestationPrice.head, 
        PrestationList.prestation_name, PrestationList.prestation_code
        FROM PrestationPrice
        JOIN PrestationList ON PrestationPrice.prestation_list_id = PrestationList.id
        WHERE PrestationPrice.annex_id = ? AND PrestationPrice.updated_by_id IS NULL;
    `;

    const [rows] = await db.execute(query, [annexId]);
    return rows;
};

// Get all prestations for a specific avenant
const getPrestationByAvenantId = async (avenantId) => {
    const query = `
        SELECT PrestationPrice.id, PrestationPrice.price, PrestationPrice.patient_part, PrestationPrice.tva,
        PrestationPrice.prestation_list_id, PrestationPrice.avenant_id, PrestationPrice.head, PrestationPrice.updated_by_id,
        PrestationList.prestation_name, PrestationList.prestation_code
        FROM PrestationPrice
        JOIN PrestationList ON PrestationPrice.prestation_list_id = PrestationList.id
        WHERE PrestationPrice.avenant_id = ?;
    `;
    const [rows] = await db.execute(query, [avenantId]);
    return rows;
};

// Edit a prestation
const editPrestation = async (prestationId, price, patient_part, tva, updated_by_id, prestation_list_id, avenant_id, head) => {
    const query = `
        UPDATE PrestationPrice 
        SET price = ?, patient_part = ?, tva = ?, updated_by_id = ?, prestation_list_id = ?, avenant_id = ?, head = ?
        WHERE id = ?
    `;

    const [result] = await db.execute(query, [price, patient_part, tva, updated_by_id, prestation_list_id, avenant_id, head, prestationId]);

    if (result.affectedRows === 0) {
        return null; // No record found with that ID
    }

    // Return the updated prestation
    return { id: prestationId, price, patient_part, tva, updated_by_id, prestation_list_id, avenant_id, head };
};

// Delete a prestation
const deletePrestation = async (prestationId) => {
    const query = `DELETE FROM PrestationPrice WHERE id = ?`;
    const [result] = await db.execute(query, [prestationId]);

    // Return true if a record was deleted, otherwise false
    return result.affectedRows > 0;
};


const deleteAvenantPrestation = async (prestationId) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Step 1: Find the prestation(s) that reference this one via updated_by_id
        const [rows] = await connection.execute(
            `SELECT id FROM PrestationPrice WHERE updated_by_id = ?`,
            [prestationId]
        );

        // Step 2: Set updated_by_id to NULL for those rows
        if (rows.length > 0) {
            await connection.execute(
                `UPDATE PrestationPrice SET updated_by_id = NULL WHERE updated_by_id = ?`,
                [prestationId]
            );
        }

        // Step 3: Delete the prestation
        const [result] = await connection.execute(
            `DELETE FROM PrestationPrice WHERE id = ?`,
            [prestationId]
        );

        await connection.commit();
        return result.affectedRows > 0;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    addPrestation,
    getPrestationByAnnexId,
    editPrestation,
    deletePrestation,
    getPrestationByAvenantId,
    deleteAvenantPrestation,
    addPrestationInAvenant
};
