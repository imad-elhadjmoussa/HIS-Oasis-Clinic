const express = require('express');
const agreementController = require('../../controllers/convention_controllers/agreement.controller');
const router = express.Router();

// Add agreement (takes contract ID as param)
router.post('/contract/:contractId', agreementController.addAgreement);

// Delete agreement (takes agreement ID as param)
router.delete('/:agreementId', agreementController.deleteAgreement);

// Edit agreement (takes agreement ID as param)
router.put('/:agreementId', agreementController.updateAgreement);

// Get all agreements for a specific contract
router.get('/contract/:contractId', agreementController.getAgreementsByContractId);

// Get agreement text/details (takes agreement ID as param)
router.get('/:agreementId', agreementController.getAgreementById);

module.exports = router;
