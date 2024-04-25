const Property = require("../model/tour_schema");
const User = require("../model/user_schema");
const usercons = require("../controllers/userscons");
const appError = require("../utils/newAppError");
const Review = require("../model/review_schema");
const catchAsync = require("../utils/catchAsync");
const booking = require("../model/bookingModel");
const APIFeatures = require("../utils/APIFreatures");
const AppError = require("../utils/newAppError");
//loggeduser to be enhanced
exports.getAllTours = catchAsync(async (req, res, next) => {
  if (req.path != "/manage-tours") pageToRender = "overview";
  res.status(200).render(pageToRender, {
    title: "Rainfall Map",
  });
});

exports.getFilteredProperties = catchAsync(async (req, res, next) => {
  const {
    bedrooms,
    bathrooms,
    propertySize,
    priceRangeMin,
    priceRangeMax,
    radius,
    latitude,
    longitude, // Adjusted to access latitude and longitude directly
  } = req.body;

  const filter = {};

  if (bedrooms) filter.bedrooms = bedrooms;
  if (bathrooms) filter.bathrooms = bathrooms;
  if (propertySize) filter.size = { $gte: propertySize };
  if (priceRangeMin && priceRangeMax)
    filter.price = { $gte: priceRangeMin, $lte: priceRangeMax };

  let filteredProperties;
  if (radius) {
    filteredProperties = await Property.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude], // Adjusted to match the correct order
          },
          $maxDistance: radius * 1000, // Convert radius from km to meters
        },
      },
      ...filter,
    });
  } else {
    filteredProperties = await Property.find(filter);
  }

  res.status(200).render("overview", { properties: filteredProperties });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const allusers = await User.find();
  const myquery = new APIFeatures(User.find(), req.query).paginate();
  const loggeduser = await User.findById(req.user.id);
  const users = await myquery.query;
  res.status(200).render("manageUsers", {
    title: "All Users",
    users,
    allusers,
    req,
    loggeduser,
  });
});
exports.getAllBookings = catchAsync(async (req, res, next) => {
  const allbookings = await booking.find();
  const myquery = new APIFeatures(booking.find(), req.query).paginate();
  const loggeduser = await User.findById(req.user.id);
  const bookings = await myquery.query;
  res.status(200).render("manageBookings", {
    title: "All Bookings",
    bookings,
    loggeduser,
    allbookings,
    req,
  });
});
exports.getUpdateUser = catchAsync(async (req, res, next) => {
  const loggeduser = await User.findById(req.user.id);
  const user = await User.findById(req.params.id);
  res.status(200).render("updateUser", {
    title: `Update ${user.name}`,
    user,
    loggeduser,
  });
});
exports.getSignUp = catchAsync(async (req, res, next) => {
  res.status(200).render("signup", {
    title: `Sign up`,
  });
});
exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert == "booking")
    res.locals.alert =
      "Your booking was successful! Please check your email for confirmation.";
  next();
};
exports.getTour = catchAsync(async (req, res, next) => {
  let loggeduser = undefined;
  if (req.user) loggeduser = await User.findById(req.user.id);
  const property = await Property.findOne({
    slug: req.params.tourName,
  }).populate({
    path: "reviews",
    fields: "review rating user",
  });
  if (!property) {
    return next(new appError("There is no property with that name.", 404));
  }

  res.status(200).render("property", {
    title: `${property.name} Property`,
    property,
    loggeduser,
  });
});

exports.getUserReviews = catchAsync(async (req, res, next) => {
  const userReviews = await Review.find({ user: req.user.id }).populate(
    "property"
  );
  const loggeduser = await User.findById(req.user.id);
  res.status(200).render("myreviews", {
    title: "My Reviews",
    reviews: userReviews,
    loggeduser,
  });
});
exports.getCreateTour = catchAsync(async (req, res, next) => {
  const loggeduser = await User.findById(req.user.id);
  res.status(200).render("createTourPage", {
    title: "New property",
    loggeduser,
  });
});
exports.getEditReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);
  const loggeduser = await User.findById(req.user.id);
  res.status(200).render("editReviewPage", {
    title: "Edit Review",
    review,
    loggeduser,
  });
});

exports.getUpdateTour = catchAsync(async (req, res, next) => {
  const property = await Property.findById(req.params.id);
  const loggeduser = await User.findById(req.user.id);
  res.status(200).render("updateTour", {
    title: "Update property",
    property,
    loggeduser,
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const loggeduser = await User.findById(req.user.id);
  res.status(200).render("useraccount", {
    title: `My Account`,
    user: req.user,
    loggeduser,
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  if (res.locals.user) return next(new appError("You are already logged in!"));
  res.status(200).render("login", {
    title: "Log into your account",
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  const loggeduser = await User.findById(req.user.id);
  const bookings = await booking.find({ user: req.user.id });
  const tourIDs = bookings.map((el) => el.property);
  const properties = await Property.find({ _id: { $in: tourIDs } });
  res.status(200).render("overview", {
    title: "My Properties",
    properties,
    loggeduser,
  });
});
