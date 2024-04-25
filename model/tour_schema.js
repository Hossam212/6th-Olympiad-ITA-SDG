const mongoose = require('mongoose');
const User = require('../model/user_schema');
const slugify = require('slugify');
const propertySchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A property must have a name'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A property name must have less or equal then 40 characters',
      ],
      minlength: [
        10,
        'A property name must have more or equal then 10 characters',
      ],
      // validate: [validator.isAlpha, 'property name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A property must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A property must have a group size'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    bedrooms: {
      type: Number,
      default: 1,
    },
    bathrooms: {
      type: Number,
      default: 1,
    },
    size: {
      type: Number,
      default: 90,
    },
    price: {
      type: Number,
      required: [true, 'A property must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A property must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A property must have a cover image'],
    },
    images: [String],
    video: {
      type: String,
      default: ' ',
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretproperty: {
      type: Boolean,
      default: false,
    },
    location: {
      type: {
        type: String,
        default: 'Point', // Set the type to "Point"
        enum: ['Point'], // Allow only "Point" type
      },
      coordinates: {
        type: [Number], // Define the coordinates as an array of numbers
        index: '2dsphere', // Create a 2dsphere index for geospatial queries
      },
      address: String, // Optional: Include address field if needed
      description: String, // Optional: Include description field if needed
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
propertySchema.index({ price: 1, ratingsAverage: -1 });
propertySchema.index({ slug: 1 });
propertySchema.index({ location: '2dsphere' });
//VIRTUAL POPULATE
propertySchema.virtual('reviews', {
  ref: 'review',
  foreignField: 'property',
  localField: '_id',
});
//-----
propertySchema.virtual('durationinWeeks').get(function () {
  return this.duration / 7;
});

propertySchema.pre('save', function (next) {
  this.slug = slugify(this.name);
  next();
});
const property = mongoose.model('property', propertySchema);

module.exports = property;
