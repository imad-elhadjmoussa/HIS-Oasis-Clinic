const express = require('express');
const agreementDetailsController = require('../../controllers/convention_controllers/agreementdetails.controller');
const router = express.Router();

// Get agreement details by contract_id
router.get('/:contract_id', agreementDetailsController.getAgreementDetailsByContractId);

// Get agreement details by avenant_id
router.get('/avenant/:avenant_id', agreementDetailsController.getAgreementDetailsByAvenantId);

// Update agreement detail by contract_id and agreementdetail_id
router.put('/:contract_id/:agreementdetail_id', agreementDetailsController.updateAgreementDetail);

module.exports = router;
