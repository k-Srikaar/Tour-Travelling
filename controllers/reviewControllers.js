const catchAsync = require('./../utlis/catchAsync');
const Review = require('./../Model/reviewsModel');

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter.tour = req.params.tourId;
  const reviews = await Review.find(filter);

  res.status(200).json({
    Status: 'Success',
    result: reviews.length,
    reviews,
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  // Allowed nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;

  const review = await Review.create(req.body);

  res.status(201).json({
    Status: 'Success',
    data: {
      review,
    },
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const reviews = await Review.findByIdAndUpdate(
    req.params.reviewId,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    Status: 'Success',
    result: reviews.length,
    reviews,
  });
});
exports.deleteReview = catchAsync(async (req, res, next) => {
  const reviews = await Review.findByIdAndDelete(
    req.params.reviewId
    // req.body,
    // {
    //   new: true,
    //   runValidators: true,
    // }
  );

  res.status(200).json({
    Status: 'Success',
    result: reviews.length,
    reviews,
  });
});
