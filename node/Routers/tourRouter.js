const express = require('express');

const tourControllers = require('./../controllers/tourControllers.js');
const { appendFile } = require('fs');

const router = express.Router();

router
  .route('/top-5-cheap')
  .get(tourControllers.aliasTopTours, tourControllers.getAllTours);

router.route('/toursMonthlyPlan/:year').get(tourControllers.getMonthlyPlan);

router.route('/tour-stats').get(tourControllers.getTourStats);

// router.use('/:id', tourControllers.checkID);

router
  .route('/:id')
  .get(
    // tourControllers.checkID, // Chaining - multiple - middleware
    tourControllers.getTour
  )
  .patch(tourControllers.updateTour)
  .delete(tourControllers.deleteTour);
// .delete(tourControllers.deleteTour);

router
  .route('/')
  .post(tourControllers.createTour)
  .get(tourControllers.getAllTours);

// router.route('/').get(tourControllers.getAllTours).post(tourControllers.createTour);

module.exports = router;
