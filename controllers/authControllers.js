const User = require('./../Model/userModel');
const catchAsync = require('./../utlis/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utlis/appError');
const { promisify } = require('util');
const sendEmail = require('./../utlis/email');
const { request } = require('http');
const crypto = require('crypto');

const signToken = (ID) => {
  return jwt.sign({ id: ID }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSignToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  res.status(statusCode).json({
    status: 'Success',
    token,
    data: {
      user: user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });
  createSignToken(newUser, 201, res);
  // const token = signToken(newUser._id);
  // res.status(201).json({
  //   status: 'Success',
  //   token,
  //   data: {
  //     user: newUser,
  //   },
  // });
});

exports.login = catchAsync(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await User.findOne({ email: email }).select('+password');
  console.log(password, user.password);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Invalid Email or Password !! ', 401));
  }

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1.Getting token and check of it's there
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in ! Please login to get access.', 401)
    );
  }

  // 2.Verification of token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3.Check if user still exists on the token
  const currentuser = await User.findById(decoded.id);
  if (!currentuser) {
    return next(
      new AppError('User belonging to the token does no longer exists', 401)
    );
  }

  // 4.Check if user changed password after  token was issued
  if (currentuser.passwordChanged(decoded.iat)) {
    return next(
      new AppError('The user has changed password , Please login again !!', 401)
    );
  }

  // console.log(token);
  req.user = currentuser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You dont have the permission to perform this action  !! ',
          403
        )
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1 . Does User exists for the Provide Password

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError('You have not Signed Up ! . Please Sign Up .'),
      404
    );
  }

  // 2 . Generate the random reset Token

  const resetToken = user.createPasswordResetToken();
  user.save({ validateBeforeSave: false });

  // 3. Send mail to the user.

  const requsetUrl = `${request.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot Passwrod ?. Submit your PATCH request with your new password and confirm password to ${requsetUrl} .\n If you did not forgot your password then ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'You have only 10 min to update the password',
      message,
    });

    res.status(200).json({
      status: 'Success ',
      message: 'Token sent to mail !',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was a error in sending email . Try Later ! '),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Get useer based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2.If token has not expired and there is user, set new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired ', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); // we wont turn off validateBeforeSave because we want to get our password and passwordConfirm to be validated

  // 3.Update change password property for the user

  // 4.Log the user in , send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1.Get user form the collection
  const currentPassword = req.body.currentPassword;
  const user = await User.findById({ _id: req.user.id }).select('+password');
  // 2.Check if posted current password is correct
  if (!(await user.correctPassword(currentPassword, user.password))) {
    return next(new AppError('Invalid email or password', 401));
  }
  // 3.If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // 4.log user in , send JWT
  const token = signToken(user._id);
  res.status(200).json({
    status: 'Success',
    token,
  });
});
