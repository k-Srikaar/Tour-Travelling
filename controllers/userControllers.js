const User = require('./../Model/userModel');
const catchAsync = require('./../utlis/catchAsync');
const bcrypt = require('bcryptjs');

const filterObj = (Obj, ...allowedProperties) => {
  const userObj = {};
  Object.keys(Obj).forEach((el) => {
    if (allowedProperties.includes(el)) {
      userObj[el] = Obj[el];
    }
  });

  return userObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'Success',
    result: users.length,
    data: {
      users,
    },
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.find({ _id: req.user.id });
  res.status(200).json({
    status: 'Success',
    user,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(200).json({
    status: 'Succes',
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const x = filterObj(req.body, 'name', 'email');
  console.log(x);
  const user = await User.findByIdAndUpdate(req.user.id, x, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'Succes',
    user,
  });
});
