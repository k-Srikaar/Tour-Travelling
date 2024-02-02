// const fs = require('fs');
// const express = require('express');
// const tours = JSON.parse(
//   fs.readFileSync(
//     '/Users/srikaar/Desktop/complete-node-bootcamp-master/4-natours/starter/dev-data/data/tours-simple.json',
//     'utf-8'
//   )
// );
// exports.checkID = (req, res, next) => {
//   if (req.params.id * 1 > tours.length - 1) {
//     return res.status(404).json({
//       result: 'fail',
//       Message: 'Invalid ID',
//     });
//   }
//   next();
// };

// exports.getAllTours = (req, res) => {
//   res.status(200).json({
//     message: 'Success',
//     results: `${tours.length}`,
//     tours: tours,
//   });
// };

// exports.getTour = (req, res) => {
//   const idd = req.params.id * 1;
//   const required_object = tours[idd];
//   res.status(200).json(required_object);
//   // console.log("Done");
// };

// exports.createTour = (req, res) => {
//   const newID = tours.length * 1;
//   console.log(req.body);
//   const newTour = Object.assign(
//     { id: newID },
//     req.body
//   );
//   tours.push(newTour);

//   fs.writeFile(
//     './dev-data/data/tours-simple.json',
//     JSON.stringify(tours),
//     'utf-8',
//     (err) => {
//       res.status(201).json({
//         status: 'Update',
//         newTour: newTour,
//       });
//       console.log('Updated Original file');
//     }
//   );
// };

// exports.deleteTour = (req, res) => {
//   const idd = req.params.id * 1;
//   // console.log(idd);
//   res
//     .status(200)
//     .send('HEllo this is put content.........');
// };
const AppError = require('../utlis/appError.js');
const Tour = require('./../Model/toursModel.js');
const APIfeatures = require('./../utlis/APIfeatures.js');
const catchAsync = require('./../utlis/catchAsync.js');

// const catchAsync = (fn) => {
//   return (req, res, next) => {
//     fn(req, res, next).catch(next);
//   };
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// exports.aliasTopTours = (req, res, next) => {
//   req.query.limit = '5';
//   req.query.sort = '-ratingsAverage,price';
//   req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
//   next();
// };

exports.getAllTours = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  console.log(req.query);
  // console.log(Tour.find()); Tour.find() is an mongoose object.
  const features = new APIfeatures(Tour.find(), req.query)
    .filter()
    .sorting()
    .limitizing()
    .pagination();
  const tours = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'Success !',
    result: tours.length,
    message: tours,
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const doc = await Tour.create(req.body); // promiese
  console.log('Tour Created !!! ');
  // console.log(req.body);
  res.status(200).json({
    status: 'Success',
    Message: doc,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);
  // Tour.findOne({_id : req.params.id});
  if (!tour) {
    return next(new AppError('This Tour does not exists !! ', 404));
  }
  console.log(tour);
  res.status(200).json({
    status: 'Found ',
    Message: tour,
  });
});
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  // Tour.findOne({_id : req.params.id});
  console.log(tour);
  res.status(200).json({
    status: 'Found ',
    Message: tour,
  });
});

exports.updateTour = catchAsync(async (req, res) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('This Tour does not exists !! ', 404));
  }

  res.status(200).json({
    status: 'Success ',
    Message: tour,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  console.log('Before await');
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        // numTours: { $sum: 1 },
        // numRatings: { $sum: '$ratingsQuantity' },
        // avgRating: { $avg: '$ratingsAverage' },
        // avgPrice: { $avg: '$price' },
        // minPrice: { $min: '$price' },
        // maxPrice: { $max: '$price' },
      },
    },

    // {
    //   $sort: { avgPrice: 1 },
    // },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);
  console.log('afger awati');
  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTours: { $sum: 1 },
        tours: { $push: '$name' },
        // date: '$startDate',
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: { numTours: -1 },
    },
  ]);
  console.log(plan);
  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});
