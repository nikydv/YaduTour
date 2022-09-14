const express = require('express');
const router = express.Router();
const viewController = require('../Controller/viewController');
const authController = require('../Controller/authController');


router.get('/', authController.isLoggedIn, viewController.overview);
router.get('/tours/:id', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.login);
router.get('/me', authController.protect, viewController.getAccount);

module.exports = router;