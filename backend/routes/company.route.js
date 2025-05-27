const express = require('express');
const companyController = require('../controllers/company.controller');
const router = express.Router();

// Get all companies

router.get('/', companyController.getAllCompanies);

// Create a new company
router.post('/', companyController.createCompany);

// Update a company by ID
router.put('/:id', companyController.updateCompany);



module.exports = router;
