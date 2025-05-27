
const medicalRecordsModel = require('../models/medical_records.model.js');

function isEmptyOrNullString(value) {
    return (
        value === undefined ||
        value === null ||
        value === '' ||
        value === 'null' || // string "null"
        value === 'undefined' // in case someone does append(undefined)
    );
}

const getMedicalsRecords = async (req, res) => {
    try {
        const medicalRecords = await medicalRecordsModel.getMedicalsRecords();
        res.status(200).json(medicalRecords);
    } catch (error) {
        console.error("Error fetching medical records:", error);
        res.status(500).json({ message: error.message });
    }
}

const createMedicalRecord = async (req, res) => {
    try {
        const medicalRecord = req.body;
        const file = req.file;

        console.log(medicalRecord);

        if (isEmptyOrNullString(medicalRecord.patient_id)) {
            return res.status(400).json({ message: 'Patient is required' });
        }
        if (isEmptyOrNullString(medicalRecord.company_id)) {
            console.log("Company ID is missing in the request body");
            return res.status(400).json({ message: 'Company is required' });
        }
        if (isEmptyOrNullString(medicalRecord.contract_id)) {
            return res.status(400).json({ message: 'Contract is required' });
        }
        if (isEmptyOrNullString(medicalRecord.prise_en_charge_date)) {
            return res.status(400).json({ message: 'Prise en Charge Date is required' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Prise en Charge Image is required' });
        }
        // Save the filename (or path if needed)
        medicalRecord.prise_en_charge_image = file.filename;
        const newMedicalRecord = await medicalRecordsModel.createMedical(medicalRecord);
        res.status(201).json(newMedicalRecord);
    } catch (error) {
        console.error("Error creating medical record:", error);
        res.status(500).json({ message: error.message });
    }
};



const getMedicalRecord = async (req, res) => {
    const { id } = req.params;
    try {
        const medicalRecord = await medicalRecordsModel.getMedicalByRecord(id);
        if (!medicalRecord) {
            return res.status(404).json({ message: 'Medical record not found' });
        }
        res.status(200).json(medicalRecord);
    } catch (error) {
        console.error("Error fetching medical record:", error);
        res.status(500).json({ message: error.message });
    }
}

const updateMedicalRecord = async (req, res) => {
    const { id } = req.params;
    const medicalRecord = req.body;
    try {
        const updatedMedicalRecord = await medicalRecordsModel.updateMedical(id, medicalRecord);
        if (!updatedMedicalRecord) {
            return res.status(404).json({ message: 'Medical record not found' });
        }
        res.status(200).json(updatedMedicalRecord);
    } catch (error) {
        console.error("Error updating medical record:", error);
        res.status(500).json({ message: error.message });
    }
}


const getMedicalsRecordSummary = async (req, res) => {
    const { id } = req.params;
    try {
        const medicalRecordSummary = await medicalRecordsModel.getMedicalRecordSummary(id);
        if (!medicalRecordSummary) {
            return res.status(404).json({ message: 'Medical record summary not found' });
        }
        res.status(200).json(medicalRecordSummary);
    }
    catch (error) {
        console.error("Error fetching medical record summary:", error);
        res.status(500).json({ message: error.message });
    }
}

const deleteMedicalRecord = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedMedicalRecord = await medicalRecordsModel.deleteMedical(id);
        if (!deletedMedicalRecord) {
            return res.status(404).json({ message: 'Medical record not found' });
        }
        res.status(200).json({ message: 'Medical record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
module.exports = {
    createMedicalRecord,
    getMedicalsRecords,
    getMedicalRecord,
    updateMedicalRecord,
    getMedicalsRecordSummary,
    deleteMedicalRecord
};