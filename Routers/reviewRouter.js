const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('./../controllers/reviewControllers');
const autController = require('./../controllers/authControllers');

router
  .route('/:reviewId')
  .patch(
    autController.protect,
    autController.restrictTo('user'),
    reviewController.updateReview
  )
  .delete(
    autController.protect,
    autController.restrictTo('user'),
    reviewController.deleteReview
  );

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    autController.protect,
    autController.restrictTo('user'),
    reviewController.createReview
  );

module.exports = router;
