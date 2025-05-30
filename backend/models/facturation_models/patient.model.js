//patient.model
const db = require("../../db/connection");

const getPatients = async () => {
  const [rows] = await db.query("SELECT * FROM patient");
  return rows;
};

const getPatientById = async (id) => {
  const [rows] = await db.query("SELECT * FROM patient WHERE id = ?", [id]);
  return rows[0]; // Return single patient object instead of array
};

const getPatientByNationalId = async (nationalId) => {
  const [rows] = await db.query("SELECT * FROM patient WHERE national_id = ?", [
    nationalId,
  ]);
  return rows[0];
};

const createPatient = async (patient) => {
  const mysqlDate = new Date(patient.date_of_birth).toISOString().split("T")[0];
  const query = `
        INSERT INTO patient (
            national_id_number, 
            first_name, 
            last_name, 
            date_of_birth, 
            gender, 
            phone_number, 
            email, 
            blood_type, 
            address
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const values = [
    patient.national_id_number,
    patient.first_name,
    patient.last_name,
    mysqlDate,
    patient.gender,
    patient.phone_number,
    patient.email,
    patient.blood_type,
    patient.address,
  ];

  try {
    const [result] = await db.query(query, values);
    return {
      ...patient,
      id: result.insertId,
    };
  } catch (error) {
    console.error("Error creating patient:", error);
    throw error;
  }
};

const updatePatient = async (id, patient) => {
  console.log(patient);
  const mysqlDate = new Date(patient.date_of_birth).toISOString().split("T")[0];
  try {
    const [result] = await db.query(
      `UPDATE patient 
             SET 
                national_id_number = ?, 
                first_name = ?, 
                last_name = ?, 
                date_of_birth = ?, 
                gender = ?, 
                phone_number = ?, 
                email = ?, 
                blood_type = ?, 
                address = ?
             WHERE id = ?`,
      [
        patient.national_id_number,
        patient.first_name,
        patient.last_name,
        mysqlDate,
        patient.gender,
        patient.phone_number,
        patient.email,
        patient.blood_type,
        patient.address,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      throw new Error("Patient not found or no changes made.");
    }

    return { ...patient, id: id };
  } catch (error) {
    console.error("Error updating patient:", error);
    throw error;
  }
};

const deletePatient = async (id) => {
  const [result] = await db.query("DELETE FROM patient WHERE patient_id = ?", [
    id,
  ]);
  return result;
};

// Additional useful patient-specific queries
const searchPatients = async (searchTerm) => {
  const [rows] = await db.query(
    `SELECT * FROM patient 
         WHERE first_name LIKE ? OR last_name LIKE ? OR national_id LIKE ? OR phone LIKE ?`,
    [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]
  );
  return rows;
};

const getPatientsByBloodType = async (bloodType) => {
  const [rows] = await db.query("SELECT * FROM patient WHERE blood_type = ?", [
    bloodType,
  ]);
  return rows;
};

const getPatientMedicalRecords = async (patientId) => {
  const q = `
    SELECT 
        MedicalRecord.id,
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
        Contract ON MedicalRecord.contract_id = Contract.id
        where MedicalRecord.patient_id = ?`;
  const [rows] = await db.query(q, [patientId]);
  return rows;
};
const getUnbilledPatientsByCompany = async (companyId) => {
  const query = `
        SELECT DISTINCT p.*, m.id as medical_record_id
        FROM Patient p
        JOIN MedicalRecord m ON p.id = m.patient_id
        LEFT JOIN InvoicePatient ip ON ip.medical_record_id = m.id
        WHERE m.company_id = ?
          AND (ip.id IS NULL OR ip.status = 'waiting')
    `;
  const [rows] = await db.query(query, [companyId]);
  return rows;
};
const getPatientsByProgressStatus = async (status) => {
  const query = `
        SELECT DISTINCT p.*, pmr.progress_status
        FROM Patient p
        JOIN MedicalRecord m ON p.id = m.patient_id
        JOIN PrestationMedicalRecored pmr ON m.id = pmr.medical_record_id
        WHERE pmr.progress_status = ?
    `;
  const [rows] = await db.query(query, [status]);
  return rows;
};
const getUnbilledPatientsWithAmountByCompany = async (companyId) => {
  const sql = `
        SELECT 
            p.id AS patient_id,
            p.first_name,
            p.last_name,
            SUM(pd.price - pd.patient_part) AS montant_entreprise
        FROM Patient p
        JOIN MedicalRecord m ON p.id = m.patient_id
        JOIN PrestationMedicalRecored pmr ON m.id = pmr.medical_record_id
        JOIN PrestationDetails pd ON pmr.prestation_details_id = pd.id
        LEFT JOIN InvoicePatient ip ON ip.medical_record_id = m.id
        WHERE m.company_id = ?
          AND m.status = 'unbilled'
          AND (ip.id IS NULL OR ip.status = 'waiting')
          AND pmr.progress_status = 'Examiner Done'
        GROUP BY p.id, p.first_name, p.last_name;
    `;

  const [rows] = await db.query(sql, [companyId]);
  return rows;
};

const getUnbilledExaminedPatientsByCompany = async (companyId) => {
  const sql = `
      SELECT 
        ip.id ,
        b.bordereau_number,
      ip.invoice_patient_number,
       ip.medical_record_id,
        p.id AS patient_id,
        p.first_name,
        p.last_name,
        ip.status,
        SUM(pp.price - pp.patient_part) AS amount
      FROM Patient p
      JOIN MedicalRecord m ON p.id = m.patient_id
      JOIN PrestationMedicalRecored pmr ON m.id = pmr.medical_record_id
      JOIN PrestationPrice pp ON pmr.prestation_price_id = pp.id
      LEFT JOIN InvoicePatient ip ON ip.medical_record_id = m.id
      LEFT JOIN Bordereau b ON b.id = ip.bordereau_id
      WHERE m.company_id = ?
        
        AND pmr.progress_status = 'Examiner Done'
        AND ip.status IN ('waiting', 'valid', 'billed')
      GROUP BY ip.id,b.bordereau_number,p.id, p.first_name, p.last_name ,ip.status,ip.medical_record_id,ip.invoice_patient_number;
    `;
  const [rows] = await db.query(sql, [companyId]);
  return rows;
};

const getPatientPrestationsWithExaminerDoneStatus = async (patientId) => {
  const sql = `
    SELECT 
      p.id AS patient_id,
      p.first_name,
      p.last_name,
      mr.id AS medical_record_id,
      mr.prise_en_charge_date,
      mr.created_at AS medical_record_date,
      pmr.id AS prestation_medical_recored_id,
      pmr.created_at AS prestation_date,
      pl.prestation_name,
      pl.prestation_code,
      pp.price,
      pp.patient_part,
      pp.tva,
      (pp.price - pp.patient_part) AS entreprise_part,
      c.company_name,
      ct.contract_name,
      -- Information sur la facture si elle existe
      ip.id AS invoice_id,
      ip.invoice_patient_number,
      ip.created_at AS invoice_date,
      ip.status AS invoice_status
    FROM PrestationMedicalRecored pmr
    JOIN MedicalRecord mr ON pmr.medical_record_id = mr.id
    JOIN Patient p ON mr.patient_id = p.id
    JOIN PrestationPrice pp ON pmr.prestation_price_id = pp.id
    JOIN PrestationList pl ON pp.prestation_list_id = pl.id
    JOIN Company c ON mr.company_id = c.id
    JOIN Contract ct ON mr.contract_id = ct.id
    -- LEFT JOIN car une prestation peut ne pas encore être facturée
    LEFT JOIN InvoicePatient ip ON ip.medical_record_id = mr.id
    WHERE 
      p.id = ?
      AND mr.status = 'unbilled'
      AND pmr.progress_status = 'Examiner Done'
    ORDER BY 
      mr.created_at DESC, 
      pmr.created_at DESC
  `;

  const [rows] = await db.query(sql, [patientId]);
  return rows;
};
const getPatientPrestationsWithExaminerStatus = async (patientId) => {
  const sql = `
    SELECT 
      p.id AS patient_id,
      p.first_name,
      p.last_name,
      mr.id AS medical_record_id,
      mr.prise_en_charge_date,
      mr.created_at AS medical_record_date,
      pmr.id AS prestation_medical_recored_id,
      pmr.created_at AS prestation_date,
      pl.prestation_name,
      pl.prestation_code,
      pp.price,
      pp.patient_part,
      pp.tva,
      (pp.price - pp.patient_part) AS entreprise_part,
      c.company_name,
      ct.contract_name,
      -- Information sur la facture si elle existe
      ip.id AS invoice_id,
      ip.invoice_patient_number,
      ip.created_at AS invoice_date,
      ip.status AS invoice_status
    FROM PrestationMedicalRecored pmr
    JOIN MedicalRecord mr ON pmr.medical_record_id = mr.id
    JOIN Patient p ON mr.patient_id = p.id
    JOIN PrestationPrice pp ON pmr.prestation_price_id = pp.id
    JOIN PrestationList pl ON pp.prestation_list_id = pl.id
    JOIN Company c ON mr.company_id = c.id
    JOIN Contract ct ON mr.contract_id = ct.id
    -- LEFT JOIN car une prestation peut ne pas encore être facturée
    LEFT JOIN InvoicePatient ip ON ip.medical_record_id = mr.id
    WHERE 
      p.id = ?
      AND mr.status = 'unbilled'
      AND pmr.progress_status = 'Examiner Done'
    ORDER BY 
      mr.created_at DESC, 
      pmr.created_at DESC
  `;

  const [rows] = await db.query(sql, [patientId]);
  return rows;
};

module.exports = {
  getPatients,
  getPatientById,
  getPatientByNationalId,
  createPatient,
  updatePatient,
  deletePatient,
  searchPatients,
  getPatientsByBloodType,
  getPatientMedicalRecords,
  getUnbilledPatientsByCompany,
  getPatientsByProgressStatus,
  getUnbilledPatientsWithAmountByCompany,
  getUnbilledExaminedPatientsByCompany,
  getPatientPrestationsWithExaminerStatus,
  getPatientPrestationsWithExaminerDoneStatus // Ajouter cette ligne
};
