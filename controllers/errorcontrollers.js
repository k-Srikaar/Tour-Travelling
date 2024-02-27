const AppError = require('./../utlis/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path} : ${err.value}`;
  // console.log('IS this working');
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  const message = `Dublicate field value ${err.keyValue.name} . Please user another name .`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const types = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data : ${types.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
    name: err.name,
  });
};

const handleJsonWebTokenErrorDB = () => {
  return new AppError('Invalid Token ,Please login again !!', 401);
};

const handleTokenExpiredErrorDB = () => {
  return new AppError('Token has been experied , Please login agian !!', 401);
};

const sendErrorPro = (err, res) => {
  if (err.isoperationalError) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log('Error 💥 ', err);

    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong !! ',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  let error = { ...err };
  // console.log(err.code);

  if (process.env.NODE_ENV == 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV == 'production') {
    // console.log(error);
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateErrorDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJsonWebTokenErrorDB();
    if (err.name === 'TokenExpiredError') error = handleTokenExpiredErrorDB();

    sendErrorPro(error, res);
  }
};
