const authController = require('../Controller/authController');

const express = require('express');
const router = express.Router();


router.post('/signUp', authController.signUp);
router.post('/logIn', authController.logIn);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.post('/updatePassword', authController.updatePassword);
router.delete('/deleteMe', authController.protect, authController.deleteMe);

router.get('/allUsers', authController.allUsers);


module.exports = router;

