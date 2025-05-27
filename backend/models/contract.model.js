const db = require("../db/connection");

// Create a new contract for a specific company
const createContractForCompany = async (companyId, contract) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Step 1: Create the contract for the company
    const query = `
            INSERT INTO Contract (contract_name, status, company_id)
            VALUES (?, ?, ?)
        `;
    const values = [contract.contract_name, 'Pending', companyId]; // Default status is 'Pending'
    const [result] = await connection.query(query, values);
    const contractId = result.insertId;

    // Step 2: Insert the AgreementDetails (start date, end date)
    const agreementQuery = `
            INSERT INTO AgreementDetails (contract_id, start_date, end_date, head)
            VALUES (?, ?, ?, ?)
        `;
    const agreementValues = [contractId, contract.start_date, contract.end_date, 'yes']; // Assuming 'yes' for the first agreement.
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

const getContractDetails = async (contractId) => {
  const q = `
  SELECT 
    Contract.id AS contract_id,
    Contract.contract_name,
    Contract.status,

    Company.id AS company_id,
    Company.company_name,

    Agreement.id AS agreement_id,
    Agreement.description AS agreement_description,
    Agreement.created_at AS agreement_created_at,

    AgreementDetails.id AS agreement_details_id,
    AgreementDetails.start_date,
    AgreementDetails.end_date,
    AgreementDetails.family_auth,
    AgreementDetails.max_price,
    AgreementDetails.min_price,
    AgreementDetails.discount_percentage,
    AgreementDetails.head AS agreement_details_head,
    AgreementDetails.created_at AS agreement_details_created_at,

    Annex.id AS annex_id,
    Annex.annex_name,
    Annex.created_at AS annex_created_at,

    Specialty.id AS specialty_id,
    Specialty.specialty_name,

    PrestationPrice.id AS prestation_price_id,
    PrestationPrice.price,
    PrestationPrice.patient_part,
    PrestationPrice.head AS prestation_price_head,

    PrestationList.id AS prestation_list_id,
    PrestationList.prestation_name,
    PrestationList.prestation_code

  FROM Contract
  RIGHT JOIN Company ON Company.id = Contract.company_id
  LEFT JOIN Agreement ON Agreement.contract_id = Contract.id
  LEFT JOIN AgreementDetails ON AgreementDetails.contract_id = Contract.id
  LEFT JOIN Annex ON Annex.contract_id = Contract.id
  LEFT JOIN Specialty ON Specialty.id = Annex.specialty_id
  LEFT JOIN PrestationPrice ON PrestationPrice.annex_id = Annex.id
  LEFT JOIN PrestationList ON PrestationList.id = PrestationPrice.prestation_list_id
  WHERE Contract.id = ?;
`;


  const [rows] = await db.query(q, [contractId]);
  if (rows.length === 0) return null;

  const base = rows[0];
  const contract = {
    contract_id: base.contract_id,
    contract_name: base.contract_name,
    status: base.status,
    company_id: base.company_id,
    company: {
      id: base.company_id,
      name: base.company_name,
    },

    agreement: base.agreement_id ? {
      id: base.agreement_id,
      description: base.agreement_description,
      created_at: base.agreement_created_at,
    } : null,

    agreement_details: base.agreement_details_id ? {
      id: base.agreement_details_id,
      start_date: base.start_date,
      end_date: base.end_date,
      family_auth: base.family_auth,
      max_price: base.max_price,
      min_price: base.min_price,
      discount_percentage: base.discount_percentage,
      head: base.agreement_details_head,
      created_at: base.agreement_details_created_at,
    } : null,

    annexes: [],
  };

  const annexMap = new Map();

  for (const row of rows) {
    if (!row.annex_id) continue;

    if (!annexMap.has(row.annex_id)) {
      annexMap.set(row.annex_id, {
        id: row.annex_id,
        annex_name: row.annex_name,
        created_at: row.annex_created_at,
        specialty: row.specialty_id ? {
          id: row.specialty_id,
          name: row.specialty_name,
        } : null,
        prestations: []
      });
    }

    // Add prestation if present
    if (row.prestation_price_id && row.prestation_list_id) {
      const annex = annexMap.get(row.annex_id);
      annex.prestations.push({
        id: row.prestation_price_id,
        price: row.price,
        patient_part: row.patient_part,
        head: row.prestation_price_head,
        prestation: {
          id: row.prestation_list_id,
          name: row.prestation_name,
          code: row.prestation_code,
        }
      });
    }
  }

  // Assign annexes array to contract
  contract.annexes = Array.from(annexMap.values());

  return contract;

};


module.exports = {
  createContractForCompany,
  getContractsByCompanyId,
  updateContractStatus,
  getAllContracts,
  getContractDetails
};
