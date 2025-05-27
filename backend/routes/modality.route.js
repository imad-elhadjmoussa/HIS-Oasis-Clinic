const express = require('express');
const router = express.Router();
const modalityController = require('../controllers/modality.controller');

// GET /api/modalities - Get all modalities
router.get('/', modalityController.getModalities);

// POST /api/modalities - Create a new modality
router.post('/', modalityController.createModality);

// PUT /api/modalities/:id - Update a modality
router.put('/:id', modalityController.updateModality);

// DELETE /api/modalities/:id - Delete a modality
router.delete('/:id', modalityController.deleteModality);

// GET /api/modalities/:modalityId/details - Get modality details
router.get('/:modalityId/details', modalityController.getModalityDetails);

module.exports = router;
