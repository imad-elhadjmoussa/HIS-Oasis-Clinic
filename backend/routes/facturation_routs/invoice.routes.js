const express = require('express');
const router = express.Router();
const invoicePatientController = require('../../controllers/facturation_controllers/invoice.controller');

router.put('/generate/:id', invoicePatientController.validateAndGenerateNumber);


module.exports = router;