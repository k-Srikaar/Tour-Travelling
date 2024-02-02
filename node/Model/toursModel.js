const mongoose = require('mongoose');
const slugify = require('slugify');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name '],
      unique: true,
      trim: true, // space wont be considered at the end ..
      minlength: [10, 'A tour should have a minimum length of 10 characters'],
      maxlength: [
        15,
        "A tour's length should not exceed more than 15 characters",
      ],
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, ' A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['Easy', 'Medium', 'Difficult'],
        message: ['Difficulty can be {Easy , Medium , Difficult}'],
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Minimum rating of 1 should be there for a tour'],
      max: [5, 'Maximum rating of 5 should be there for a tour'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount is Greater than the price !!',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual properties
tourSchema.virtual('duratoinweeks').get(function () {
  return this.duration / 7; // virtual Function not gettig added to database get executed in get call
});

// DOCUMENT MIDDLE-WARES
tourSchema.pre('save', function (next) {
  console.log('slugify');
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

//QUERY MIDDLE-WARE
//tourSchema.pre('find', function (next)
tourSchema.pre(/^find/, function (next) {
  // all the queries having starting with find will not show secret tours
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  console.log(
    doc,
    `Query took ${Date.now() - this.start} milliseconds to complete ..`
  );
  next();
});

// AGGREGATIOIN MIDDEL-WARE

tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
});

const Tour = mongoose.model('Tour', tourSchema); // Creation of a model

module.exports = Tour;
