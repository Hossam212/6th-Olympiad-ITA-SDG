const express = require('express');
const userauth = require('../controllers/authcons');
const bookingcons = require('../controllers/bookingcons');
const router = express.Router();
router.use(express.json());
router.use(userauth.protect);

router.get('/checkout-session/:tourId', bookingcons.getCheckOutSession);
router.use(userauth.restrictTo('admin', 'lead-guide'));
router.route('/').get(bookingcons.getAllBookings).post(bookingcons.makeBooking);
router
  .route('/:id')
  .get(bookingcons.getBooking)
  .patch(bookingcons.updateBooking)
  .delete(bookingcons.deleteBooking);
module.exports = router;
