const express = require('express');
const avenantController = require('../../controllers/convention_controllers/avenant.controller');
const router = express.Router();

//creat avenant
router.post('/avenant_creat/:contractId', avenantController.createAvenantAndDuplicatePrestations);

// Activate Avenant
router.put('/activate/:avenantId', avenantController.activateAvenant);

//Get Avenant info by ID
router.get('/:avenantId', avenantController.getAvenantById);

// Check if a contract has a pending Avenant
router.get('/pending/check/:contractId', avenantController.checkPendingAvenantByContractId);

// Get all Avenants for a contract
router.get('/contract/:contractId', avenantController.getAvenantsByContractId);

module.exports = router;
