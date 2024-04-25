module.exports = class AppError extends Error {
  constructor(message, statuscode) {
    super(message);
    this.statuscode = statuscode;
    if (`${statuscode}`[0] === '4') this.status = 'fail';
    else this.status = 'error';
    this.Operational = true;
    Error.captureStackTrace(this, this.constructor);
  }
};
