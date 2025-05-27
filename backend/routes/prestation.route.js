const express = require('express');
const router = express.Router();
const prestationController = require('../controllers/prestation.controller');

router.get('/', prestationController.getPrestations);

router.post('/', prestationController.createPrestation);

router.put('/:id', prestationController.updatePrestation);

router.delete('/:id', prestationController.deletePrestation);


module.exports = router;
