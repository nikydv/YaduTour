const authController = require('../Controller/authController');
const reviewController = require('../Controller/reviewController');

const express = require('express');
const router = express.Router();

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(authController.protect, authController.restictTo('user'), reviewController.createReview);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.protect, authController.restictTo('admin', 'user'),
    reviewController.updateReview
  )
  .delete(authController.protect, authController.restictTo('admin', 'user'), reviewController.deleteReview);  

module.exports = router;  
