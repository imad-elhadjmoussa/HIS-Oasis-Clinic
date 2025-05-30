// routes/patient.route.js
const express = require('express');
const patientController = require('../../controllers/facturation_controllers/patient.controller');
const router = express.Router();

// Routes patients
// router.get('/', patientController.getPatients);
// router.get('/:id', patientController.getPatient);
// router.post('/', patientController.createPatient);
// router.put('/:id', patientController.updatePatient);
// router.delete('/:id', patientController.deletePatient);

// Recherche et filtres
router.get('/search', patientController.searchPatients);
router.get('/progress-status/:status', patientController.getPatientsByProgressStatus);

// Routes spécifiques à l'entreprise
router.get('/company/:companyId/unbilled-patients', patientController.getUnbilledPatientsByCompany);
router.get('/company/:companyId/unbilled-examined-patients', patientController.getUnbilledExaminedPatientsByCompany);

// Route pour récupérer les prestations avec status "Examiner Done" pour un patient
router.get('/:patientId/prestations/examiner-done', patientController.getPatientPrestationsWithExaminerDoneStatus);
router.get('/:patientId/prestations/examiner-don', patientController.getPatientPrestationsWithExaminerStatus);

module.exports = router;
