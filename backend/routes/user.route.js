const express = require('express');
const userController = require('../controllers/user.controller');
const isAuthenticated = require('../middlewars/authenticated');
const authorizeRoles = require('../middlewars/authorizeRoles');
const router = express.Router();

router.get('/',  userController.getUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

router.put('/profile/:id', userController.updateUserProfile);


module.exports = router;