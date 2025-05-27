
const MedicalRecordPrestation = require('../models/medical_record-prestation.model');

const createMedicalRecordPrestation = async (req, res) => {
    try {
        const medical_record_prestation = await MedicalRecordPrestation.createMedicalRecordPrestation(req.body);
        res.status(201).json({
            message: "Medical record prestation created successfully",
            data: medical_record_prestation
        });
    } catch (error) {
        console.error("Error creating medical record prestation:", error.message);
        res.status(500).json({
            message: "Error creating medical record prestation",
            error: error.message
        });
    }
}

const getMedicalRecordPrestations = async (req, res) => {
    const medical_record_id = req.params.medical_record_id;
    const medical_record_prestations = await MedicalRecordPrestation.getPrestationsMediclRecord(medical_record_id);
    res.status(200).json(medical_record_prestations);
}

const getPrestationPrice = async (req, res) => {
    const { contract_id, specialty_id, prestation_id, date } = req.query;

    const prestation_price = await MedicalRecordPrestation.getPrestationPriceId(contract_id, date, specialty_id, prestation_id);

    if (!prestation_price) {
        return res.status(404).json({ message: "No prestation price found for the provided parameters." });
    }

    res.status(200).json(prestation_price);
}

const deleteMedicalRecordPrestation = async (req, res) => {
    const id = req.params.id;
    try {
        const medical_record_prestation = await MedicalRecordPrestation.deleteUnpaidPrestationMedicalRecored(id);
        if (!medical_record_prestation) {
            return res.status(404).json({ message: "Error in deleting Medical Record Prestation" });
        }
        res.status(200).json({
            message: "Medical record prestation deleted successfully",
            data: medical_record_prestation
        });
    } catch (error) {
        res.status(500).json({ message: "Error deleting medical record prestation", error: error.message });
    }

}



module.exports = {
    createMedicalRecordPrestation,
    getMedicalRecordPrestations,
    getPrestationPrice,
    deleteMedicalRecordPrestation

}   