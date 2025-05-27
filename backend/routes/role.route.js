const express = require('express');
const roleController = require('../controllers/role.controller');
const router = express.Router();

router.get('/', roleController.getRoles);
router.post('/', roleController.createRole);

module.exports = router;