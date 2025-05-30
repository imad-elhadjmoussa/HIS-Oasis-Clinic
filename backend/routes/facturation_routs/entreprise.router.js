// entreprise.router
const express = require('express');
const { getEntreprises } = require('../../controllers/facturation_controllers/entreprise.controller.js');

const router = express.Router();

router.get('/', getEntreprises);

module.exports = router;
