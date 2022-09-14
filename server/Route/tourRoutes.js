const tourController = require('../Controller/tourController');
const authController = require('../Controller/authController');

const express = require('express');
const router = express.Router();

router
   .route('/')
   .get(tourController.getAllTours)
   .post(authController.protect, authController.restictTo('admin', 'lead-guide'), tourController.createTour);

    
router
   .route('/:id')
   .get(tourController.getTour)
   .patch(
      authController.protect,
      authController.restictTo('admin', 'lead-guide'),
      tourController.uploadTourImages,
      tourController.resizeTourImages,
      tourController.updateTour
    )
   .delete(
      authController.protect,
      authController.restictTo('admin', 'lead-guide'),
      tourController.deleteTour
   )  
   

module.exports = router;
