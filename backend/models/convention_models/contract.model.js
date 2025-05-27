const db = require("./../../db/connection");

// Create a new contract for a specific company
const createContractForCompany = async (companyId, contract) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        // Step 1: Create the contract for the company
        const query = `
            INSERT INTO Contract (contract_name, status, company_id, is_general)
            VALUES (?, ?, ?, 'no')
        `;
        const values = [contract.contract_name, 'Pending', companyId]; // Default status is 'Pending'
        const [result] = await connection.query(query, values);
        const contractId = result.insertId;

        // Step 2: Insert the AgreementDetails (start date, end date, max price, min price, percentage, auth Family)
        const agreementQuery = `
            INSERT INTO AgreementDetails (
                contract_id, 
                start_date, 
                end_date, 
                max_price, 
                min_price, 
                discount_percentage, 
                family_auth,
                head
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const agreementValues = [
            contractId,
            contract.start_date,
            contract.end_date,
            contract.max_price || null,
            contract.min_price || null,
            contract.discount_percentage || null,
            contract.family_auth || null,
            'yes' // Assuming 'yes' for the first agreement
        ];
        await connection.query(agreementQuery, agreementValues);

        // Commit the transaction if everything works fine
        await connection.commit();
        return {
            id: contractId,
            contract_name: contract.contract_name,
            status: 'Pending',
            company_id: companyId
        };
    } catch (error) {
        // Rollback if any error occurs
        await connection.rollback();
        console.error("Error creating contract:", error);
        throw error;
    } finally {
        connection.release();
    }
};

// Get all contracts for a specific company (only latest AgreementDetails)
const getContractsByCompanyId = async (companyId, status) => {
    let query = `
 SELECT
      Contract.id,
      Contract.contract_name,
      Contract.status,
      DATE_FORMAT(AgreementDetails.start_date, '%Y-%m-%d') AS start_date,
      DATE_FORMAT(AgreementDetails.end_date, '%Y-%m-%d') AS end_date
  FROM Contract
  JOIN AgreementDetails
      ON AgreementDetails.contract_id = Contract.id
  WHERE
      Contract.company_id = ?
      AND AgreementDetails.updated_by_id IS NULL
  ORDER BY Contract.id DESC
`;

    const params = [companyId];

    // Add status filter if provided
    if (status) {
        query += ` AND Contract.status = ?`;
        params.push(status);
    }

    const [contracts] = await db.query(query, params);
    return contracts;
};


// Update the status of a contract
const updateContractStatus = async (contractId, newStatus) => {
    const query = `
        UPDATE Contract
        SET status = ?
        WHERE id = ?
    `;
    const [result] = await db.query(query, [newStatus, contractId]);

    if (result.affectedRows === 0) {
        return null; // No contract found with the given ID
    }

    // Fetch the updated contract to return
    const [rows] = await db.query(`SELECT * FROM Contract WHERE id = ?`, [contractId]);
    return rows[0]; // Return the updated contract

};

// Get all contracts (only latest AgreementDetails)
const getAllContracts = async () => {
    const query = `
    SELECT 
        Contract.id,
        Contract.contract_name,
        Contract.status,
        DATE_FORMAT(AgreementDetails.start_date, '%Y-%m-%d') AS start_date,
        DATE_FORMAT(AgreementDetails.end_date, '%Y-%m-%d') AS end_date
    FROM Contract
    JOIN AgreementDetails 
        ON AgreementDetails.contract_id = Contract.id
    WHERE AgreementDetails.updated_by_id IS NULL
    `;
    const [contracts] = await db.query(query);
    return contracts;
};


// Get contract info by ID with the company name and agreement details
const getContractById = async (contractId) => {
    const [rows] = await db.query(
        `SELECT
            Contract.id,
            Contract.contract_name,
            Contract.status,
            Company.company_name,
            DATE_FORMAT(AgreementDetails.start_date, '%d/%m/%Y') AS start_date,
            DATE_FORMAT(AgreementDetails.end_date, '%d/%m/%Y') AS end_date,
            Contract.is_general
        FROM Contract
        JOIN Company ON Contract.company_id = Company.id
        LEFT JOIN AgreementDetails
            ON AgreementDetails.contract_id = Contract.id
            AND AgreementDetails.updated_by_id IS NULL
        WHERE Contract.id = ?`,
        [contractId]
    );
    return rows[0];
};

// Delete contract and all associated data
const deleteContractById = async (contractId) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        
        // Step 1: Delete AgreementDetails for this contract
        await connection.query(
            'DELETE FROM AgreementDetails WHERE contract_id = ?',
            [contractId]
        );
        
        // Step 2: Find all annexes for this contract
        const [annexes] = await connection.query(
            'SELECT id FROM Annex WHERE contract_id = ?',
            [contractId]
        );
        
        if (annexes.length > 0) {
            // Get array of annex IDs
            const annexIds = annexes.map(annex => annex.id);
            
            // Delete prestation prices associated with these annexes
            await connection.query(
                'DELETE FROM PrestationPrice WHERE annex_id IN (?)',
                [annexIds]
            );
            
            // Delete the annexes
            await connection.query(
                'DELETE FROM Annex WHERE id IN (?)',
                [annexIds]
            );
        }
        
        // Step 3: Delete agreements for this contract
        await connection.query(
            'DELETE FROM Agreement WHERE contract_id = ?',
            [contractId]
        );
        
        // Step 4: Delete the contract itself
        const [result] = await connection.query(
            'DELETE FROM Contract WHERE id = ?',
            [contractId]
        );
        
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        console.error("Error deleting contract:", error);
        throw error;
    } finally {
        connection.release();
    }
};


module.exports = {
    createContractForCompany,
    getContractsByCompanyId,
    updateContractStatus,
    getAllContracts,
    getContractById,
    deleteContractById
};
