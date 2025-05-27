const express = require('express');
const router = express.Router();
const prestationListController = require('../../controllers/convention_controllers/prestationlist.controller');

// Get prestation list items based on annex's specialty
router.get('/annex/:annexId', prestationListController.getPrestationListByAnnexId);

// Get prestation list items based on avenant
router.get('/avenant/:avenantId', prestationListController.getPrestationListByAvenantId);

module.exports = router;