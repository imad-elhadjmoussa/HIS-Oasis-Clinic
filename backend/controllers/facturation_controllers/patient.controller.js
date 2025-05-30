const patientModel = require('../../models/facturation_models/patient.model');

const getPatients = async (req, res) => {
  try {
    const patients = await patientModel.getPatients();
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPatient = async (req, res) => {
  try {
    const id = req.params.id;
    const patient = await patientModel.getPatientById(id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPatient = async (req, res) => {
  try {
    const { national_id_number, first_name, last_name, date_of_birth, phone_number, email } = req.body;
    if (!national_id_number || !first_name || !last_name || !date_of_birth || !phone_number)
      return res.status(400).json({ message: "Required fields missing" });

    const dob = new Date(date_of_birth);
    if (isNaN(dob.getTime()) || dob >= new Date())
      return res.status(400).json({ message: "Invalid date of birth" });

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ message: "Invalid email format" });

    const newPatient = await patientModel.createPatient(req.body);
    res.status(201).json({ message: "Patient created", patient: newPatient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePatient = async (req, res) => {
  try {
    const id = req.params.id;
    const { email, date_of_birth } = req.body;

    const existingPatient = await patientModel.getPatientById(id);
    if (!existingPatient) return res.status(404).json({ message: "Patient not found" });

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ message: "Invalid email format" });

    if (date_of_birth) {
      const dob = new Date(date_of_birth);
      if (isNaN(dob.getTime()) || dob >= new Date())
        return res.status(400).json({ message: "Invalid date of birth" });
    }

    const updatedPatient = await patientModel.updatePatient(id, req.body);
    res.json({ message: "Patient updated", patient: updatedPatient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletePatient = async (req, res) => {
  try {
    const id = req.params.id;
    const patient = await patientModel.getPatientById(id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const result = await patientModel.deletePatient(id);
    res.json({ message: "Patient deleted", result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchPatients = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2)
      return res.status(400).json({ message: "Query must be at least 2 characters" });

    const patients = await patientModel.searchPatients(query);
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPatientMedicalRecords = async (req, res) => {
  try {
    const id = req.params.id;
    const records = await patientModel.getPatientMedicalRecords(id);
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUnbilledPatientsByCompany = async (req, res) => {
  try {
    const companyId = req.params.companyId;
    const patients = await patientModel.getUnbilledPatientsByCompany(companyId);
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPatientsByProgressStatus = async (req, res) => {
  try {
    const status = req.params.status;
    const patients = await patientModel.getPatientsByProgressStatus(status);
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUnbilledExaminedPatientsByCompany = async (req, res) => {
  try {
    const companyId = req.params.companyId;
    const patients = await patientModel.getUnbilledExaminedPatientsByCompany(companyId);
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPatientPrestationsWithExaminerDoneStatus = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const prestations = await patientModel.getPatientPrestationsWithExaminerDoneStatus(patientId);
    res.json(prestations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getPatientPrestationsWithExaminerStatus = async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const prestations = await patientModel.getPatientPrestationsWithExaminerStatus(patientId);
    res.json(prestations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  searchPatients,
  getPatientMedicalRecords,
  getUnbilledPatientsByCompany,
  getPatientsByProgressStatus,
  getUnbilledExaminedPatientsByCompany,
  getPatientPrestationsWithExaminerDoneStatus,
  getPatientPrestationsWithExaminerStatus
};
