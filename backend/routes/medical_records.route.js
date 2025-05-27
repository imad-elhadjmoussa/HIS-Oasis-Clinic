const express = require('express');
const router = express.Router();
const multer = require('multer');

const medicalRecordsController = require('../controllers/medical_records.controller.js');

// Set up Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/medical-records/'); // Folder must exist
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// Routes
router.get('/', medicalRecordsController.getMedicalsRecords);
router.get('/:id/summary', medicalRecordsController.getMedicalsRecordSummary);
router.get('/:id', medicalRecordsController.getMedicalRecord);
// router.get('/patient/:patientId', medicalRecordsController.getMedicalByPatientId);
router.post('/', upload.single('prise_en_charge_image'), medicalRecordsController.createMedicalRecord);
router.patch('/:id', medicalRecordsController.updateMedicalRecord);
router.delete('/:id', medicalRecordsController.deleteMedicalRecord);

module.exports = router;
