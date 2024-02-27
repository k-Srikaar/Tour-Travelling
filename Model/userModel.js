const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide us your name '],
    },
    email: {
      type: String,
      required: [true, 'Please provide us your email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide us a valid email'],
    },
    photo: {
      type: String,
    },
    password: {
      type: String,
      required: [true, 'Please provide us password'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please Confirm the password'],
      // This only works on Create and Save
      validate: {
        validator: function (val) {
          return this.password === val;
        },
        message: 'Password does not match',
      },
    },
    passwordChangedAt: Date,
    role: {
      type: String,
      default: 'user',
      enum: {
        values: ['admin', 'lead-guide', 'guide', 'user'],
        message: 'Person can have roles : admin , lead-guide , guide , user .',
      },
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
//--------------------------
// userSchema.pre('findOneAndUpdate', async function (next) {
//   // if (!this.isModified('password')) {
//   //   return next();
//   // }

//   this.password = await bcrypt.hash(this.password, 12);
//   this.passwordConfirm = undefined;
//   next();
// });
//-----------start-------
userSchema.methods.correctPassword = async (
  candidatePassword,
  userPassword
) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChanged = (JWTTimestamp) => {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    console.log(changedTimestamp, JWTTimestamp);

    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
//----------end------------
// userSchema.methods.updatepass = async function (newPassword) {
//   this.password = await bcrypt.hash(newPassword, 12);
//   return this.password;
// };

const User = mongoose.model('User', userSchema);

module.exports = User;
