//prestation.routes
const express = require('express');
const router = express.Router();
const prestationController = require('../../controllers/cashier/prestation.controller');

// Exemple de route existante
router.get('/fiche/:ficheId', prestationController.getByFicheId);

// Route pour modifier le montant payé
router.put('/:id', prestationController.updateMontantPaye);

// ✅ Route pour modifier le prix de la prestation
router.put('/:id/price', prestationController.updatePrice);


module.exports = router;