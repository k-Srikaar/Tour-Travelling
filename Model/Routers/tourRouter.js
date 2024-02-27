const express = require('express');
const authControllers = require('./../controllers/authControllers.js');
const tourControllers = require('./../controllers/tourControllers.js');
// const reviewControllers = require('./../controllers/reviewControllers.js');
const reviewRouter = require('./../Routers/reviewRouter.js');
// const fs = require('fs');

const router = express.Router();

// Post /:tourId/reviews
// router
//   .route('/:tourId/reviews')
//   .post(
//     authControllers.protect,
//     authControllers.restrictTo('user'),
//     reviewControllers.createReview
//   )
//   .get(reviewControllers.getAllReviews);

router.use('/:tourId/reviews', reviewRouter);

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
  .delete(
    authControllers.protect,
    authControllers.restrictTo('admin', 'lead-guide'),
    tourControllers.deleteTour
  );
// .delete(tourControllers.deleteTour);

router
  .route('/')
  .post(tourControllers.createTour)
  .get(authControllers.protect, tourControllers.getAllTours);
// router.route('/').get(tourControllers.getAllTours).post(tourControllers.createTour);

module.exports = router;
