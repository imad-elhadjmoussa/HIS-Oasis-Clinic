const express = require('express');
const patientController = require('../controllers/patient.controller');
const router = express.Router();

const { validatePatient } = require('../middlewars/patientValidation');

// Basic CRUD routes
router.get('/', patientController.getPatients);
router.get('/:id', patientController.getPatient);
router.post('/', validatePatient, patientController.createPatient);
router.put('/:id', validatePatient, patientController.updatePatient);
router.delete('/:id', patientController.deletePatient);
router.get('/:id/medical-records', patientController.getPatientMedicalRecords);



module.exports = router;
