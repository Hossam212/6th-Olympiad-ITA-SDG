const Review = require('../model/review_schema');
const factory = require('../controllers/factorycons');
exports.setUserIdsTourIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

//CRUD operations
exports.getAllReviews = factory.getAll(Review);
exports.makeReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.getReview = factory.getOne(Review);
exports.updateReview = factory.updateOne(Review);
