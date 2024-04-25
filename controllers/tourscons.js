const Tour = require('../model/tour_schema');
const ffmpeg = require('fluent-ffmpeg');
const appError = require('../utils/newAppError');
const multer = require('multer');
const sharp = require('sharp');
const catchAsync = require('../utils/catchAsync');
const factory = require('../controllers/factorycons');

const multerImageStorage = multer.memoryStorage();
const multerVideoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/vid');
  },
  filename: (req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `tour-${req.params.id}-${Date.now()}-video.${ext}`);
  },
});

// Filter for video files
const multerVideoFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true); // Accept video files
  } else {
    cb(new Error('Please upload only video files.'), false);
  }
};
const multerImageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new appError('Only images are allowed.', 400), false);
  }
};
const uploadVideo = multer({
  storage: multerVideoStorage,
  fileFilter: multerVideoFilter,
});

const uploadImage = multer({
  storage: multerImageStorage,
  fileFilter: multerImageFilter,
});

exports.uploadTourVideo = uploadVideo.fields([{ name: 'video', maxCount: 1 }]);
exports.saveTourVideo = (req, res, next) => {
  const video = req.files.video[0];

  req.body.video = `tour-${
    req.params.id
  }-${Date.now()}-video.${video.originalname.split('.').pop()}`;

  next();
};

exports.uploadTourImages = uploadImage.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.images || !req.files.imageCover) return next();
  //Tour cover image processing
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 13333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  req.body.images = [];
  //Tour images processing
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );
  next();
});

exports.gettop5tours = (req, res, next) => {
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage';
  next();
};
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit == 'mil' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    return next(
      new appError(
        'Please provide latitude and longtitude in the format lat, lng.',
        400
      )
    );
  }
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });
  res.status(200).json({
    status: 'success',
    data: {
      tours,
    },
  });
});
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  if (!lat || !lng) {
    return next(
      new appError(
        'Please provide latitude and longtitude in the format lat, lng.',
        400
      )
    );
  }
  const multiplier = unit === 'ml' ? 0.000621371 : 0.001;
  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      distances,
    },
  });
});
//CRUD operations
exports.createTour = factory.createOne(Tour);
exports.getAlltours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
