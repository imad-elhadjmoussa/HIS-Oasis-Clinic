const express = require('express');
const { 
  getFacturesValidees, 
  getFacturesValideesAvecCalcul, 
  getFactureDetails,
  generateStatementSheet 
} = require('../../controllers/facturation_controllers/bord.controller');

const router = express.Router();

// Routes existantes
router.get('/valid', getFacturesValidees);
router.get('/valid-calcul', getFacturesValideesAvecCalcul);
router.get('/details/:invoiceId', getFactureDetails);

// Nouvelle route pour générer le bordereau
router.post('/generate-statement', generateStatementSheet);

module.exports = router;