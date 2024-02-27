const catchAsync = require('../utlis/catchAsync');
const Tour = require('./../Model/toursModel');

exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();

  res.status(200).render('overview', {
    tours,
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  // 1 Get the data ,for the requested tour (including the reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating user',
  });
  // 2

  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Login to your account',
  });
};
