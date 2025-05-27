const express = require('express');
const router = express.Router();

const medicalRecordPrestationController = require('../controllers/medical_record-prestation.controller');

router.post('/', medicalRecordPrestationController.createMedicalRecordPrestation);
router.get('/medicalRecord/:medical_record_id', medicalRecordPrestationController.getMedicalRecordPrestations);

router.get('/prestationPrice', medicalRecordPrestationController.getPrestationPrice);

router.delete('/:id', medicalRecordPrestationController.deleteMedicalRecordPrestation);





module.exports = router;