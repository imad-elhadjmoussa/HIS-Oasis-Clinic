const express = require('express');
const annexController = require('../../controllers/convention_controllers/annex.controller');
const router = express.Router();

// Add annex (contractId as param)
router.post('/:contractId', annexController.createAnnex);

// Edit annex (annexId as param)
router.put('/:annexId', annexController.updateAnnex);

// Get all annexes for a contract (contractId as param)
router.get('/contract/:contractId', annexController.getAnnexesByContract);

// Get annex by annexId
router.get('/:annexId', annexController.getAnnexById);

// Check if prestations exist under a specific annex
router.get('/:annexId/has-prestations', annexController.hasPrestationsUnderAnnex);

//delete annex
router.delete('/:annexId', annexController.deleteAnnex);

module.exports = router;
