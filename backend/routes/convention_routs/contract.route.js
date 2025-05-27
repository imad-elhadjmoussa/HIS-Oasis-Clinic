const express = require('express');
const contractController = require('../../controllers/convention_controllers/contract.controller');
const router = express.Router();

// Create a new contract for a specific company
router.post('/company/:companyId', contractController.createContractForCompany);

// Get all contracts
router.get('/', contractController.getAllContracts);

// Get all contracts for a specific company
router.get('/company/:companyId', contractController.getContractsByCompanyId);

// Change contract status to 'Active'
router.patch('/contract/:contractId/activate', contractController.activateContract);

// Change contract status to 'Expired'
router.patch('/contract/:contractId/expire', contractController.expireContract);

//get a contract info
router.get('/:contractId', contractController.getContractById);

// Delete contract route
router.delete('/:contractId', contractController.deleteContract);

module.exports = router;
