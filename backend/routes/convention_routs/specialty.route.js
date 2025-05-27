const express = require('express');
const router = express.Router();
const specialtyController = require('../../controllers/convention_controllers/specialty.controller');

// GET /api/specialties/:contractId - Get all specialties that are not used for a annex in contract
router.get('/:contractId', specialtyController.getAllSpecialties);

module.exports = router;
