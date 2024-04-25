const appError = require('../utils/newAppError');
//WHILE IN DEVELOPMENT ERROR
const handleDevError = (req, res, err) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statuscode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
    });
  } else {
    // RENDERED WEBSITE
    res.status(err.statuscode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
};
//WHILE IN PRODUCTION ERROR
const handleProducError = (req, res, err) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.Operational == true) {
      res.status(err.statuscode).json({
        status: err.status,
        message: err.message,
      });
    } else {
      console.error('ERROR', err);
      return res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
      });
    }
  } else {
    if (err.Operational == true) {
      res.status(err.statuscode).render('error', {
        title: 'Something went wrong!',
        msg: err.message,
      });
    } else {
      console.error('ERROR', err);
      res.status(err.statuscode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later.',
      });
    }
  }
};
//-----------------
module.exports = (err, req, res, next) => {
  err.statuscode = err.statuscode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    handleDevError(req, res, err);
  } else if (process.env.NODE_ENV === 'production') {
    let myerr = { ...err };
    myerr.message = err.message;
    if (err.code == 11000) {
      myerr = new appError(
        "There's another field with the same name, please change the name and try again.",
        400
      );
    } else if (err.name == 'CastError') {
      myerr = new appError(`Invalid ${err.path}: ${err.value}.`, 400);
    } else if (err.name == 'ValidationError') {
      myerr = new appError(`Invalid input data: ${err.message} `, 400);
    }
    handleProducError(req, res, myerr);
  }
};
