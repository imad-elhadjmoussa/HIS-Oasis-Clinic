const express = require('express');
const companyController = require('../../controllers/convention_controllers/company.controller');
const router = express.Router();

// Get all companies

router.get('/', companyController.getAllCompanies);

// Create a new company
router.post('/', companyController.createCompany);

// Update a company by ID
router.put('/:id', companyController.updateCompany);

// Get a company by ID
router.get('/:id', companyController.getCompanyById);

module.exports = router;
