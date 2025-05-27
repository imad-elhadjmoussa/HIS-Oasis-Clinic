
const db = require('../db/connection.js');

const getMedicalsRecords = async () => {
  const [rows] = await db.query(`
      SELECT 
        MedicalRecord.id,
        MedicalRecord.status,
        MedicalRecord.created_at,
        Patient.id AS patient_id,
        Patient.first_name,
        Patient.last_name,
        Patient.national_id_number,
        Company.company_name,
        Contract.contract_name
      FROM 
        MedicalRecord
      JOIN 
        Patient ON MedicalRecord.patient_id = Patient.id
      JOIN 
        Company ON MedicalRecord.company_id = Company.id
      JOIN 
        Contract ON MedicalRecord.contract_id = Contract.id;
    `);
  return rows;
};


const getMedicalByRecord = async (id) => {
  // First, get the base medical record
  const [recordRows] = await db.query('SELECT * FROM MedicalRecord WHERE id = ?', [id]);
  if (recordRows.length === 0) return null;

  const record = recordRows[0];

  // Then get the prestation summary
  const q = `
    SELECT 
      COUNT(PMR.id) AS prestation_count,
      IFNULL(SUM(PP.patient_part), 0) AS total_patient_part,
      SUM(CASE WHEN PMR.progress_status = 'unaffected' THEN 1 ELSE 0 END) AS total_uneffected,
      SUM(CASE WHEN PMR.progress_status = 'Examiner Done' THEN 1 ELSE 0 END) AS total_effected
    FROM MedicalRecord MR
    LEFT JOIN PrestationMedicalRecored PMR ON PMR.medical_record_id = MR.id
    LEFT JOIN PrestationPrice PP ON PMR.prestation_price_id = PP.id
    WHERE MR.id = ?
    GROUP BY MR.id;
  `;

  const [summaryRows] = await db.query(q, [id]);

  const summary = summaryRows[0] || {
    prestation_count: 0,
    total_patient_part: 0,
    total_uneffected: 0,
    total_effected: 0
  };

  return {
    ...record,
    prestation_count: summary.prestation_count,
    total_patient_part: summary.total_patient_part,
    total_uneffected: summary.total_uneffected,
    total_effected: summary.total_effected
  };
};



const getMedicalByPatientId = async (patientId) => {
  const [rows] = await db.query('SELECT * FROM medical_records WHERE patient_id = ?', [patientId]);
  return rows[0];
}

const createMedical = async (medical) => {
  const date = new Date(medical.prise_en_charge_date);
  const formattedDate = date.toLocaleDateString('en-CA');
  console.log(formattedDate);

  const query = `
    INSERT INTO MedicalRecord (
      patient_id,
      company_id, 
      contract_id,
      prise_en_charge_date,
      prise_en_charge_image
    ) 
    VALUES (?, ?, ?, ?, ?)
  `;

  const values = [
    parseInt(medical.patient_id),
    parseInt(medical.company_id),
    parseInt(medical.contract_id),
    formattedDate,
    medical.prise_en_charge_image  // use uploaded file's name/path
  ];

  try {
    const [result] = await db.query(query, values);
    return {
      ...medical,
      id: result.insertId
    };
  } catch (error) {
    console.error("Error creating medical record:", error);
    throw error;
  }
};


const updateMedical = async (id, data) => {
  const fields = [];
  const values = [];

  // Check if contract_id is being updated
  const isUpdatingContract = Object.prototype.hasOwnProperty.call(data, 'contract_id');

  if (isUpdatingContract) {
    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM PrestationMedicalRecored WHERE medical_record_id = ?',
      [id]
    );

    if (rows[0].count > 0) {
      throw new Error('Cannot update MedicalRecord Contract');
    }
  }

  for (const key in data) {
    fields.push(`${key} = ?`);
    values.push(data[key]);
  }

  if (fields.length === 0) return null; // nothing to update

  const sql = `UPDATE MedicalRecord SET ${fields.join(', ')} WHERE id = ?`;
  values.push(id);

  const [result] = await db.query(sql, values);

  if (result.affectedRows === 0) return null;

  // optionally return updated row:
  const [updated] = await db.query(`SELECT * FROM MedicalRecord WHERE id = ?`, [id]);
  return updated[0];
};


const getMedicalRecordSummary = async (recordId) => {
  const q = `
      SELECT 
        MedicalRecord.id AS medical_record_id,
        COUNT(PrestationMedicalRecored.id) AS prestation_count,
        SUM(PrestationPrice.patient_part) AS total_patient_part
      FROM MedicalRecord
      LEFT JOIN PrestationMedicalRecored ON PrestationMedicalRecored.medical_record_id = MedicalRecord.id
      LEFT JOIN PrestationPrice ON PrestationMedicalRecored.prestation_price_id = PrestationPrice.id
      WHERE MedicalRecord.id = ?
      GROUP BY MedicalRecord.id;
    `;

  const [rows] = await db.query(q, [recordId]);
  return rows[0] || null;
};

const deleteMedical = async (id) => {
  try {
    const [result] = await db.query('DELETE FROM MedicalRecord WHERE id = ?', [id]);
    if (result.affectedRows === 0) return null; // No rows deleted, record not found
    return true; // Successfully deleted
  } catch (error) {
    throw new Error('You cannot delete this medical record because it have medical acts');
  }

};




module.exports = {
  getMedicalsRecords,
  getMedicalByRecord,
  getMedicalByPatientId,
  createMedical,
  updateMedical,
  getMedicalRecordSummary,
  deleteMedical
};