const patientModel = require('../models/patient.model');

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

        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const createPatient = async (req, res) => {
    try {
        const { national_id_number, first_name, last_name, date_of_birth, phone_number, email } = req.body;

        // 1. Check for required fields
        if (!national_id_number || !first_name || !last_name || !date_of_birth || !phone_number) {
            return res.status(400).json({ message: "National ID, name, date of birth and phone are required" });
        }

        // 4. Validate date format and ensure it's in the past
        const dob = new Date(date_of_birth);
        if (isNaN(dob.getTime()) || dob >= new Date()) {
            return res.status(400).json({ message: "Invalid date of birth" });
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // 6. Create new patient
        const newPatient = await patientModel.createPatient(req.body);
        res.status(201).json({ message: "Patient created successfully", patient: newPatient });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updatePatient = async (req, res) => {
    try {
        const id = req.params.id;
        // 6. Perform the update
        const updatedPatient = await patientModel.updatePatient(id, req.body);
        res.json({ message: "Patient updated successfully", patient: updatedPatient });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deletePatient = async (req, res) => {
    try {
        const id = req.params.id;
        await patientModel.deletePatient(id);
        res.json({ message: "Patient deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const searchPatients = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query || query.length < 2) {
            return res.status(400).json({ message: "Search query must be at least 2 characters" });
        }

        const patients = await patientModel.searchPatients(query);
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPatientMedicalRecords = async (req, res) => {
    try {
        const id = req.params.id;
        const medicalRecords = await patientModel.getPatientMedicalRecords(id);

        res.json(medicalRecords);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    getPatients,
    getPatient,
    createPatient,
    updatePatient,
    deletePatient,
    searchPatients,
    getPatientMedicalRecords
};