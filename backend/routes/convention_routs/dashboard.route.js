const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/convention_controllers/dashboard.controller');

// Main dashboard endpoint - gets all data at once
router.get('/', dashboardController.getDashboardData);

// Individual metric endpoints for more granular requests
router.get('/contract-stats', dashboardController.getContractStats);
router.get('/recent-contracts', dashboardController.getRecentContracts);
router.get('/top-companies', dashboardController.getTopCompanies);
router.get('/specialty-stats', dashboardController.getSpecialtyStats);
router.get('/monthly-contracts', dashboardController.getMonthlyContractData);
router.get('/expiring-contracts', dashboardController.getExpiringContracts);
router.get('/active-avenants', dashboardController.getActiveAvenantsCount);
router.get('/prestation-analytics', dashboardController.getPrestationPriceAnalytics);

module.exports = router;