const mongoose = require('mongoose');
const Property = require('./tour_schema');
const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "A review can't be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    property: {
      type: mongoose.Schema.ObjectId,
      ref: 'property',
      required: [true, 'A review must belong to a property'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A review must belong to a user'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reviewSchema.statics.calcAverageRatings = async function (propertyId) {
  const stats = await this.aggregate([
    {
      $match: { property: propertyId },
    },
    {
      $group: {
        _id: '$property',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  if (stats.length > 0)
    await Property.findByIdAndUpdate(
      propertyId,
      { ratingsQuantity: stats[0].nRating },
      { ratingsAverage: stats[1].avgRating }
    );
  else {
    await Property.findByIdAndUpdate(
      propertyId,
      { ratingsQuantity: 0 },
      { ratingsAverage: 4.5 }
    );
  }
};
reviewSchema.index({ user: 1, tour: 1 }, { unique: true });
reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.property);
});
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.doc = await this.findOne();
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  await this.doc.constructor.calcAverageRatings(this.doc.property);
});
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  this.populate({
    path: 'property',
  });
  next();
});
module.exports = mongoose.model('review', reviewSchema);
