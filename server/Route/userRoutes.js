const authController = require('../Controller/authController');
const userController = require('../Controller/userController');
const viewController = require('../Controller/viewController');
const multer = require('multer');

const upload = multer({ dest: 'Public/img/users'});

const express = require('express');
const router = express.Router();


router.post('/signUp', authController.signUp);
router.post('/logIn', authController.logIn);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);


router.patch(
    '/updateMe',
    authController.protect,
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateMe
  );
router.patch('/updatePassword', authController.protect, authController.updatePassword);


router.delete('/deleteMe', authController.protect, authController.deleteMe);

router.get('/allUsers', authController.protect, authController.allUsers);


module.exports = router;
