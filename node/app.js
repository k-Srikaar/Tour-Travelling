const express = require('express');
const morgan = require('morgan');
const app = express();
const tourRouter = require('./Routers/tourRouter.js');
const userRouter = require('./Routers/userRouter.js');
const AppError = require('./utlis/appError.js');
const globalErrorHandler = require('./controllers/errorcontrollers.js');
//---------------------------------------1 MIDDLE-WARE-------------------------------

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(express.json());

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

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
