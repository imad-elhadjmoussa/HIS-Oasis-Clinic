const express = require('express');
const contactController = require('../../controllers/convention_controllers/contact.controller');
const router = express.Router();

// Get all contacts for a company
router.get('/:companyId', contactController.getContactsByCompanyId);

// Add a new contact to a company
router.post('/:companyId', contactController.addContactToCompany);

// Update a contact by contact ID
router.put('/edit/:contactId', contactController.updateContact);

// Delete a contact by contact ID
router.delete('/:contactId', contactController.deleteContact);

module.exports = router;
