const duplicateAllPrestationsWithNewAvenant = async (connection, contractId) => {
  try {
    await connection.beginTransaction();

    // Create a new Avenant with head = 'yes' and status = 'Pending'
    const [avenantInsert] = await connection.execute(
      `INSERT INTO Avenant (contract_id, status, head) VALUES (?, ?, ?)`,
      [contractId, 'Pending', 'yes']
    );

    const newAvenantId = avenantInsert.insertId;

    // Get annexes for the contract
    const [annexes] = await connection.execute(
      'SELECT id FROM Annex WHERE contract_id = ?',
      [contractId]
    );

    if (annexes.length === 0) throw new Error('No annexes found for contract');

    const annexIds = annexes.map(a => a.id);

    // Get all latest prestations linked to these annexes
    const [prestations] = await connection.query(
      `SELECT * FROM PrestationPrice 
       WHERE annex_id IN (?) AND updated_by_id IS NULL`,
      [annexIds]
    );

    const newIds = [];

    // Duplicate Prestations
    for (const old of prestations) {
      // Insert duplicated prestation linked to the new Avenant with head = 'no'
      const [insertResult] = await connection.execute(
        `INSERT INTO PrestationPrice 
          (prestation_list_id, price, patient_part, annex_id, avenant_id, head, tva)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          old.prestation_list_id,
          old.price,
          old.patient_part,
          old.annex_id,
          newAvenantId,
          'no', // duplicated prestation should have head = 'no'
          old.tva
        ]
      );

      const newId = insertResult.insertId;

      // Update the old prestation to point to the new duplicated prestation
      await connection.execute(
        `UPDATE PrestationPrice SET updated_by_id = ? WHERE id = ?`,
        [newId, old.id]
      );

      newIds.push({ oldId: old.id, newId });
    }

    // Duplicate AgreementDetails (only the latest where updated_by_id is NULL)
    const [agreementDetails] = await connection.query(
      `SELECT * FROM AgreementDetails 
       WHERE contract_id = ? AND updated_by_id IS NULL`,
      [contractId]
    );

    if (agreementDetails.length > 0) {
      const oldAgreementDetail = agreementDetails[0]; // Assuming only one record for the contract

      // Insert the new AgreementDetails with head = 'no' (duplicate with new avenant_id)
      const [agreementInsert] = await connection.execute(
        `INSERT INTO AgreementDetails 
         (contract_id, avenant_id, head, start_date, end_date, family_auth, max_price, min_price, discount_percentage)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, // Include all relevant columns
        [
          contractId,
          newAvenantId, // Set the new avenant_id
          'no', // head for new agreement detail should be 'no'
          oldAgreementDetail.start_date, // Copy the start date
          oldAgreementDetail.end_date, // Copy the end date
          oldAgreementDetail.family_auth, // Copy the family_auth value
          oldAgreementDetail.max_price, // Copy the max_price value
          oldAgreementDetail.min_price, // Copy the min_price value
          oldAgreementDetail.discount_percentage, // Copy the discount_percentage value
        ]
      );

      const newAgreementDetailId = agreementInsert.insertId;

      // Update the old AgreementDetails to point to the new one
      await connection.execute(
        `UPDATE AgreementDetails SET updated_by_id = ? WHERE id = ?`,
        [newAgreementDetailId, oldAgreementDetail.id]
      );
    }

    await connection.commit();

    return { avenantId: newAvenantId, prestations: newIds };
  } catch (error) {
    await connection.rollback();
    throw error;
  }
};


const duplicateAllPrestationsWithExistingAvenant = async (connection, contractId) => {
  try {
    await connection.beginTransaction();

    // 1. Find the latest avenant (updated_by_id IS NULL)
    const [latestAvenants] = await connection.execute(
      `SELECT * FROM Avenant 
       WHERE contract_id = ? AND updated_by_id IS NULL 
       ORDER BY id DESC LIMIT 1`,
      [contractId]
    );

    if (latestAvenants.length === 0) throw new Error('No existing avenant found for contract');

    const oldAvenant = latestAvenants[0];

    // 2. Create a new avenant (head = 'no', status = 'Pending')
    const [newAvenantInsert] = await connection.execute(
      `INSERT INTO Avenant (contract_id, status, head) VALUES (?, ?, ?)`,
      [contractId, 'Pending', 'no']
    );

    const newAvenantId = newAvenantInsert.insertId;

    // 3. Update old avenant: updated_by_id = new avenant id
    await connection.execute(
      `UPDATE Avenant 
       SET  updated_by_id = ? 
       WHERE id = ?`,
      [newAvenantId, oldAvenant.id]
    );

    const newIds = [];

    // 4. Get annexes for the contract
    const [annexes] = await connection.execute(
      'SELECT id FROM Annex WHERE contract_id = ?',
      [contractId]
    );

    if (annexes.length === 0) throw new Error('No annexes found for contract');

    const annexIds = annexes.map(a => a.id);

    // 5. Get all latest prestations linked to old avenant
    const [prestations] = await connection.query(
      `SELECT * FROM PrestationPrice 
       WHERE annex_id IN (?) AND avenant_id = ? AND updated_by_id IS NULL`,
      [annexIds, oldAvenant.id]
    );

    // 6. Duplicate Prestations
    for (const old of prestations) {
      const [insertResult] = await connection.execute(
        `INSERT INTO PrestationPrice 
          (prestation_list_id, price, patient_part, annex_id, avenant_id, head, tva)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          old.prestation_list_id,
          old.price,
          old.patient_part,
          old.annex_id,
          newAvenantId,
          'no',
          old.tva
        ]
      );

      const newId = insertResult.insertId;

      // Update the old prestation to point to the new one
      await connection.execute(
        `UPDATE PrestationPrice SET updated_by_id = ? WHERE id = ?`,
        [newId, old.id]
      );

      newIds.push({ oldId: old.id, newId });
    }

    // 7. Duplicate AgreementDetails
    const [agreementDetails] = await connection.query(
      `SELECT * FROM AgreementDetails 
       WHERE contract_id = ? AND avenant_id = ? AND updated_by_id IS NULL`,
      [contractId, oldAvenant.id]
    );

    if (agreementDetails.length > 0) {
      const oldAgreementDetail = agreementDetails[0];

      const [agreementInsert] = await connection.execute(
        `INSERT INTO AgreementDetails 
         (contract_id, avenant_id, head, start_date, end_date, family_auth, max_price, min_price, discount_percentage)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          contractId,
          newAvenantId,
          'no',
          oldAgreementDetail.start_date,
          oldAgreementDetail.end_date,
          oldAgreementDetail.family_auth,
          oldAgreementDetail.max_price,
          oldAgreementDetail.min_price,
          oldAgreementDetail.discount_percentage,
        ]
      );

      const newAgreementDetailId = agreementInsert.insertId;

      // Update old agreement detail to point to new one
      await connection.execute(
        `UPDATE AgreementDetails SET updated_by_id = ? WHERE id = ?`,
        [newAgreementDetailId, oldAgreementDetail.id]
      );
    }

    await connection.commit();

    return { newAvenantId, prestations: newIds };
  } catch (error) {
    await connection.rollback();
    throw error;
  }
};

const activateAvenantById = async (connection, avenantId, activateAt, isDelayedActivation) => {
  try {
    await connection.beginTransaction();
   
    if (isDelayedActivation) {
      // Only set the activate_at date without changing status
      await connection.execute(
        `UPDATE Avenant
         SET activate_at = ?
         WHERE id = ?`,
        [activateAt, avenantId]
      );
     
      // Just update the activate_at for related prestation prices
      await connection.execute(
        `UPDATE PrestationPrice
         SET activate_at = ?
         WHERE avenant_id = ?`,
        [activateAt, avenantId]
      );
     
      // Retrieve the current status to make sure we're returning correct data
      const [rows] = await connection.execute(
        `SELECT status FROM Avenant WHERE id = ?`,
        [avenantId]
      );
     
      await connection.commit();
      return {
        avenantId,
        scheduledAt: activateAt,
        status: rows[0]?.status || 'Pending'  // Return actual status
      };
    } else {
      // First get the contract_id for this avenant
      const [avenantRows] = await connection.execute(
        `SELECT contract_id, head FROM Avenant WHERE id = ?`,
        [avenantId]
      );
     
      if (!avenantRows.length) {
        throw new Error('Avenant not found');
      }
     
      const { contract_id: contractId, head } = avenantRows[0];
      
      // Find the active avenant that references this avenant (if any)
      const [predecessorRows] = await connection.execute(
        `SELECT id FROM Avenant 
         WHERE updated_by_id = ? AND status = 'Active'`,
        [avenantId]
      );
      
      if (predecessorRows.length > 0) {
        // Deactivate the predecessor avenant and set its inactive_at date
        await connection.execute(
          `UPDATE Avenant
           SET status = 'Inactive', Inactive_at = ?
           WHERE id = ?`,
          [activateAt, predecessorRows[0].id]
        );
      } else if (head === 'yes') {
        // This is a head avenant with no active predecessor
        // Find and deactivate any active avenants for this contract
        await connection.execute(
          `UPDATE Avenant
           SET status = 'Inactive', Inactive_at = ?
           WHERE contract_id = ? AND status = 'Active'`,
          [activateAt, contractId]
        );
      }
     
      // Now activate the new avenant
      await connection.execute(
        `UPDATE Avenant
         SET status = 'Active', activate_at = ?
         WHERE id = ?`,
        [activateAt, avenantId]
      );
     
      // Update activate_at for related prestation prices
      await connection.execute(
        `UPDATE PrestationPrice
         SET activate_at = ?
         WHERE avenant_id = ?`,
        [activateAt, avenantId]
      );
     
      await connection.commit();
      return {
        avenantId,
        activatedAt: activateAt,
        status: 'Active'  // Status is now active
      };
    }
  } catch (error) {
    await connection.rollback();
    throw error;
  }
};

const getAvenantById = async (connection, avenantId) => {
  const [rows] = await connection.execute(
    `SELECT
        Avenant.id,
        Avenant.contract_id,
        Avenant.status,
        DATE_FORMAT(Avenant.created_at, '%d/%m/%Y %H:%i:%s') AS created_at,
        DATE_FORMAT(Avenant.activate_at, '%d/%m/%Y') AS activate_at,
        Contract.status AS contract_status
     FROM Avenant
     INNER JOIN Contract ON Avenant.contract_id = Contract.id
     WHERE Avenant.id = ?`,
    [avenantId]
  );
  
  return rows[0];
};


const findPendingAvenantByContractId = async (connection, contractId) => {
  const [rows] = await connection.execute(
      'SELECT id FROM Avenant WHERE contract_id = ? AND status = "Pending" LIMIT 1',
      [contractId]
  );
  return rows[0] || null;
};



const getAvenantsByContractId = async (connection, contractId) => {
  try {
    // Fetch avenants related to the given contractId
    const [rows] = await connection.execute(
      'SELECT id, contract_id, status, DATE_FORMAT(created_at, "%d/%m/%Y %H:%i:%s") AS created_at FROM Avenant WHERE contract_id = ? ORDER BY id DESC',
      [contractId]
    );

    return rows; // Return all the avenants found
  } catch (error) {
    console.error('Error fetching avenants by contract ID:', error);
    throw error; // Rethrow the error for controller to handle
  }
};



module.exports = {
  duplicateAllPrestationsWithNewAvenant,
  duplicateAllPrestationsWithExistingAvenant,
  activateAvenantById,
  getAvenantById,
  findPendingAvenantByContractId,
  getAvenantsByContractId
};
