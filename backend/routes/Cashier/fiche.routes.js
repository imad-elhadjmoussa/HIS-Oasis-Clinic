const express = require('express');
const ficheController = require('../../controllers/cashier/ficheNavette.controller');
const router = express.Router();

// 🔄 Changer la route '/' vers '/unbilled' si tu ne veux plus de fiches facturées
router.get('/unbilled', ficheController.getUnbilled);  // ✅ uniquement les fiches "unbilled"
router.get('/:id', ficheController.getById);           // ✅ fiche par ID

module.exports = router;
