const express = require('express');
const reviewRouter = require('../reviews');
const tourscons = require('../../controllers/tourscons');
const userauth = require('../../controllers/authcons');
const router = express.Router();
router.use(express.json());
router.use('/:tourId/reviews', reviewRouter);
router
  .route('/')
  .get(tourscons.getAlltours)
  .post(
    userauth.protect,
    userauth.restrictTo('admin', 'lead-guide'),
    tourscons.uploadTourImages,
    tourscons.resizeTourImages,
    tourscons.createTour
  )
  .delete(
    userauth.protect,
    userauth.restrictTo('admin', 'lead-guide'),
    tourscons.deleteTour
  );
router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourscons.getToursWithin);
router.route('/center/:latlng/unit/:unit').get(tourscons.getDistances);
router.route('/top-5-tours').get(tourscons.gettop5tours, tourscons.getAlltours);
router
  .route('/:id')
  .get(tourscons.getTour)
  .patch(
    userauth.protect,
    userauth.restrictTo('admin', 'lead-guide'),
    tourscons.uploadTourImages,
    tourscons.resizeTourImages,
    tourscons.updateTour
  )
  .delete(tourscons.deleteTour);

module.exports = router;
