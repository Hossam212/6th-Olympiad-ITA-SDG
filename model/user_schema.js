const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A user must have a name!'],
    unique: [true, 'Name is already taken. Please try another one'],
  },
  role: {
    type: String,
    required: [true, 'A user must have a role'],
    enum: {
      values: ['user', 'admin'],
      message: 'User role is either: user, admin, lead-guide',
    },
    default: 'user',
  },
  email: {
    type: String,
    required: [true, 'Please enter your email.'],
    unique: [true, 'Email already used.'],
    validate: [validator.isEmail, 'Please enter a valid email address.'],
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Please enter your password!'],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password!'],
    validate: {
      validator: function () {
        return this.confirmPassword == this.password;
      },
      message: 'Passwords are not the same!',
    },
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordResetToken: String,
  changedPasswordAt: Date,
  passwordTokenExpires: Date,
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});
UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  this.changedPasswordAt = Date.now() - 1000;
  next();
});

UserSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});
UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
UserSchema.methods.changedPasswordAfter = (tokentime) => {
  if (this.changedPasswordAt) {
    const timestamp = parseInt(this.changedPasswordAt.getTime() / 1000, 10);
    return tokentime < timestamp;
  }
  return false;
};
UserSchema.methods.createPassResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  const encryptedToken = crypto
    .createHash('sha258')
    .update(token)
    .digest('hex');
  this.passwordResetToken = encryptedToken;
  this.passwordTokenExpires = Date.now() + 10 * 60 * 1000;
  return token;
};
module.exports = mongoose.model('User', UserSchema);
