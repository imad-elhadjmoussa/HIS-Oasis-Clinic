// routes/paiement.routes.js

const express = require('express');
const router = express.Router();
const paiementController = require('../../controllers/cashier/paiement.controller');

// Ajouter un nouveau paiement et mettre à jour le statut automatiquement
router.post('/', paiementController.createPaiement);

// Récupérer l'historique des paiements d'une prestation
router.get("/prestation/:id", paiementController.getPaiementsByPrestation);
console.log("✅ paiementRoutes loaded")
module.exports = router;