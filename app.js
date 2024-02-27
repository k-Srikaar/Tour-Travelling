const path = require('path');
const express = require('express');
const morgan = require('morgan');
const app = express();
const tourRouter = require('./Routers/tourRouter.js');
const userRouter = require('./Routers/userRouter.js');
const AppError = require('./utlis/appError.js');
const globalErrorHandler = require('./controllers/errorcontrollers.js');
const ratelimiter = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const reviewRouter = require('./Routers/reviewRouter.js');
const viewRouter = require('./Routers/viewRouter.js');
const cookieParser = require('cookie-parser');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1 Global MIDDLE-WARE
// serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set SECURITY HTTP HEADERS
app.use(helmet());

// DEVELOPMENT LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//BODY PARSER ,READING DATA FROM THE req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

//DATA SANITIZATION AGAINST NOSQL QUERY INJECTION
app.use(mongoSanitize());

// DATA SANITIZATION AGAINST XSS
app.use(xss());

// PERVENT PARAMETER POLLUTION
app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'difficulty',
      'maxGroupSize',
      'ratingsQuantity',
      'ratingsAverage',
    ],
  })
);

// LIMITING REQUESTS FORM THE SAME API
const limiter = ratelimiter({
  max: 100,
  winddowMS: 60 * 60 * 1000,
  message: 'To many attempts try after 1 hour !! ',
});
app.use('/api', limiter);

// Test Middle-ware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

// 2 ROUTERS

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  // part - 1
  // res.status(404).json({
  //   Message: `Requested URL ${req.originalUrl} does not exists `,
  // });
  // part - 2
  // const err = new Error(`Requested URL ${req.originalUrl} does not exists `);
  // err.status = 'fail';
  // err.statusCode = 404;
  // next(err);
  // part - 3
  next(new AppError(`Requested URL ${req.originalUrl} does not exists `, 404));
});

app.use(globalErrorHandler);

module.exports = app;
