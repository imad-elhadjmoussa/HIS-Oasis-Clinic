
const testController = require('../controllers/test.controller.js');

const express = require('express');
const router = express.Router();

// get all companies
// router.get('/companies', testController.getCompanies);

// get all contracts for a specific company
router.get('/companies/:id/contracts', testController.getCompanyContracts);

module.exports = router;
