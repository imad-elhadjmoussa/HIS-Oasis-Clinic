
const db = require('../db/connection');

const createMedicalRecordPrestation = async (data) => {
    try {
        const { specialty_id, medical_record_id, prestation_id, doctor_id } = data;

        const [medical_record] = await db.query(
            `SELECT contract_id,status,prise_en_charge_date FROM MedicalRecord WHERE id = ?`,
            [medical_record_id]
        );


        if (medical_record[0].status === 'billed') {
            throw new Error("Cannot add prestation to a billed medical record.");
        }

        const prise_en_charge_date_format = new Date(medical_record[0].prise_en_charge_date);
        const formatted = prise_en_charge_date_format.toLocaleDateString('en-CA');


        // Step 1: Get the PrestationPrice ID
        const prestation_price_id = await getPrestationPriceId(
            medical_record[0].contract_id,
            formatted,
            specialty_id,
            prestation_id
        );

        if (!prestation_price_id) {
            throw new Error("No prestation price found for the provided parameters.");
        }

        const [patientPartRwo] = await db.query(
            'SELECT patient_part FROM PrestationPrice WHERE id = ?',
            [prestation_price_id]
        );

        // Step 2: Insert into Prestation table
        const insertQuery = `
      INSERT INTO PrestationMedicalRecored (
        medical_record_id,
        prestation_price_id,
        doctor_id,
        prestation_price
      ) VALUES (?, ?, ?,?)
    `;

        const [insertResult] = await db.query(insertQuery, [
            medical_record_id,
            prestation_price_id,
            doctor_id,
            patientPartRwo[0].patient_part
        ]);


        const prestationId = insertResult.insertId;

        // Step 3: Fetch related info using the inserted prestation ID
        const selectQuery = `
      SELECT 
        PrestationMedicalRecored.id,
        PrestationList.prestation_name,
        PrestationList.prestation_code,
        Specialty.specialty_name,
        PrestationPrice.patient_part
      FROM PrestationMedicalRecored
      JOIN PrestationPrice ON PrestationMedicalRecored.prestation_price_id = PrestationPrice.id
      JOIN PrestationList ON PrestationPrice.prestation_list_id = PrestationList.id
      JOIN Specialty ON PrestationList.specialty_id = Specialty.id
      WHERE PrestationMedicalRecored.id = ?
    `;

        const [rows] = await db.query(selectQuery, [prestationId]);

        return {
            prestationId,
            ...rows[0],
        };
    } catch (error) {
        console.error("Error creating medical record prestation:", error.message);
        throw new Error("Failed to create medical record prestation.");
    }

};


const getPrestationPriceId = async (contractId, date, specialtyId, prestationId) => {
    const contractHasAvenant = await hasAvenant(contractId);
    if (contractHasAvenant) {
        const avenantId = await isDatePriseEnChargeCompatibleWithAvnant(contractId, date);
        if (!avenantId) {
            const ppriceContract = await getPrestationPriceFromContract(contractId, specialtyId, prestationId)
            return ppriceContract;
        } else {
            const ppriceAvenant = await getPrestationPriceFromAvenant(avenantId, prestationId);
            if (!ppriceAvenant) {
                const [rows] = await db.query(`
                    SELECT id
                    FROM Contract
                    WHERE is_general = 'yes'
                `);
                const publicContractId = rows[0].id;
                return getPrestationPriceId(publicContractId, date, specialtyId, prestationId);
            }
            return ppriceAvenant;
        }

    } else {
        const ppriceContract = await getPrestationPriceFromContract(contractId, specialtyId, prestationId)
        if (!ppriceContract) {
            const [rows] = await db.query(`
                SELECT id
                FROM Contract
                WHERE is_general = 'yes'
            `);
            const publicContractId = rows[0].id;
            return getPrestationPriceId(publicContractId, date, specialtyId, prestationId);
        }
        return ppriceContract;
    }
};

const getPrestationsMediclRecord = async (medical_record_id) => {
    const query = `
        SELECT 
            PrestationMedicalRecored.id,
            PrestationMedicalRecored.payment_status,
            PrestationList.prestation_name,
            PrestationList.prestation_code,
            Specialty.specialty_name,
            PrestationPrice.patient_part,
            PrestationPrice.price
        FROM PrestationMedicalRecored
        JOIN PrestationPrice ON PrestationMedicalRecored.prestation_price_id = PrestationPrice.id
        JOIN PrestationList ON PrestationPrice.prestation_list_id = PrestationList.id
        JOIN Specialty ON PrestationList.specialty_id = Specialty.id
        WHERE PrestationMedicalRecored.medical_record_id = ?
    `;

    const [rows] = await db.query(query, [medical_record_id]);
    return rows;
}



async function hasAvenant(contractId) {
    try {
        const [rows] = await db.query(
            'SELECT COUNT(*) AS count FROM Avenant WHERE contract_id = ?',
            [contractId]
        );


        return rows[0].count > 0;
    } catch (err) {
        console.error('Error checking for avenant:', err);
        throw err;
    }
}

async function isDatePriseEnChargeCompatibleWithAvnant(contractId, date) {
    const [avenantRows] = await db.query(`
      SELECT id
      FROM Avenant
      WHERE contract_id = ?
        AND activate_at <= ?
        AND (Inactive_at IS NULL OR Inactive_at > ?)
      ORDER BY activate_at DESC
      LIMIT 1
    `, [contractId, date, date]);

    if (!avenantRows.length) {
        return null; // No active avenant found
    }
    return avenantRows[0].id;
}

async function getPrestationPriceFromAvenant(avenantId, prestationListId) {
    try {
        const [priceRows] = await db.query(`
      SELECT id
      FROM PrestationPrice
      WHERE avenant_id = ?
        AND prestation_list_id = ?
      LIMIT 1
    `, [avenantId, prestationListId]);

        if (!priceRows.length) {
            return null; // No price found for the given avenant and prestation
        }
        return priceRows[0].id;
    } catch (err) {
        console.error('Error in getPrestationPriceId:', err);
        throw err;
    }
}

const getPrestationPriceFromContract = async (contractId, specialtyId, prestationId) => {
    const query = `
    SELECT PrestationPrice.id
    FROM PrestationPrice
    JOIN Annex ON PrestationPrice.annex_id = Annex.id
    WHERE Annex.contract_id = ?
      AND Annex.specialty_id = ?
      AND PrestationPrice.prestation_list_id = ?
      AND PrestationPrice.avenant_id IS NULL
`;

    try {
        // First attempt with the provided contractId
        const [primaryRows] = await db.query(query, [contractId, specialtyId, prestationId]);
        console.log(primaryRows);

        if (primaryRows.length > 0) {
            return primaryRows[0].id;
        }

        // Fallback to contract_id = 1
        const [fallbackRows] = await db.query(query, [1, specialtyId, prestationId]);

        if (fallbackRows.length > 0) {
            return fallbackRows[0].id;
        }

        // If nothing is found, return null
        return null;
    } catch (error) {
        console.error("Error retrieving prestation price ID:", error.message);
        throw error;
    }
}



async function deleteUnpaidPrestationMedicalRecored(id) {
    try {
        const [result] = await db.query(
            `DELETE FROM PrestationMedicalRecored 
       WHERE id = ? AND payment_status = 'unpaid'`,
            [id]
        );

        if (result.affectedRows > 0) {
            console.log(`Record with ID ${id} deleted successfully.`);
            return true;
        } else {
            console.log(`No unpaid record found with ID ${id}.`);
            return false;
        }
    } catch (error) {
        console.error('Error deleting record:', error);
        throw error;
    }
}

module.exports = {
    createMedicalRecordPrestation,
    getPrestationsMediclRecord,
    getPrestationPriceId,
    deleteUnpaidPrestationMedicalRecored
}
