const express = require('express');
const router = express.Router();
const prestationPriceController = require('../../controllers/convention_controllers/prestationprice.controller');

// Add a prestation (Annex ID as param)
router.post('/add/:annexId', prestationPriceController.addPrestation);

// Add a prestation in an avenant (Avenant ID as param)
router.post('/add-prestation-avenant/:avenantId', prestationPriceController.addPrestationInAvenant);

// Get all prestations for an annex (Annex ID as param)
router.get('/annex/:annexId', prestationPriceController.getPrestationByAnnexId);

// Get all prestations for an avenant (Avenant ID as param)
router.get('/avenant/:avenantId', prestationPriceController.getPrestationByAvenantId);

// Edit a prestation (Prestation Price ID as param)(non avenant)
router.put('/edit/:prestationId', prestationPriceController.editPrestation);

// Delete a prestation (Prestation Price ID as param)(non avenant)
router.delete('/delete/:prestationId', prestationPriceController.deletePrestation);

// Delete a prestation that belongs to an avenant (Prestation Price ID as param)
router.delete('/delete-avenant-prestation/:prestationId', prestationPriceController.deleteAvenantPrestation);



module.exports = router;
