const { promisify } = require('util');
const dotenv = require('dotenv');
const User = require('../model/user_schema');
const catchAsync = require('../utils/catchAsync');
const appError = require('../utils/newAppError');
const Email = require('../utils/sendEmail');
const jsonwebtoken = require('jsonwebtoken');
const crypto = require('crypto');
dotenv.config({ path: '../config.env' });
const signToken = (id) => {
  return jsonwebtoken.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRES * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create();
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(user, url).sendWelcome();

  createSendToken(user, 200, req, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      status: 'fail',
      message: 'No email or password entered!',
    });
  } else {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password!',
      });
    } else {
      createSendToken(user, 200, req, res);
    }
  }
});
exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
});
exports.protect = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else return next(new appError('Bad auth token', 401));

  //if user still fresh
  const decoded = await promisify(jsonwebtoken.verify)(
    req.cookies.jwt,
    process.env.JWT_SECRET
  );
  const user = await User.findById(decoded.id);
  if (!user)
    return next(
      new appError("You aren't logged in! please log in to get access", 401)
    );
  //if password hasn't changed the password since the token was issued
  if (user.changedPasswordAfter(decoded.iat))
    return next(
      new appError(
        "Please login again because you've changed your password",
        401
      )
    );

  req.user = user;
  //res.locals.user = user;
  next();
});
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      const decoded = await promisify(jsonwebtoken.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      const user = await User.findById(decoded.id);
      if (!user) return next();
      if (user.changedPasswordAfter(decoded.iat)) return next();
      res.locals.user = user;
      req.user = user;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    const role = req.user.role;
    if (roles.includes(role)) return next();
    else {
      return next(
        new appError("You're not authorized to enter this page.", 403)
      );
    }
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new appError('No user found with the specified email address.', 404)
    );
  }
  //create pass reset token
  const token = user.createPassResetToken();
  await user.save({ validateBeforeSave: false });
  //now, send an email with that token
  try {
    const url = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${token}`;
    await new Email(user, url).resetPassword();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new appError(
        'An error happened while sending the email. Please try again later.',
        500
      )
    );
  }
  createSendToken(user, 200, req, res);
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const token = req.params.token;
  crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ passwordResetToken: token });

  if (!user || user.passwordTokenExpires < Date.now() + 10 * 60 * 1000)
    return next(
      new appError('Token expired or not found. Please try again.', 401)
    );
  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordTokenExpires = undefined;
  await user.save();
  createSendToken(user, 200, req, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new appError('Your current password is wrong.', 401));
  }

  user.password = req.body.newPassword;
  user.confirmPassword = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 200, req, res);
});
