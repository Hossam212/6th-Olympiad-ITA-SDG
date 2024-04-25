const express = require("express");
const userauth = require("../controllers/authcons");
const reviewscons = require("../controllers/reviewcons");
const router = express.Router({ mergeParams: true });
router.use(express.json());
router.use(userauth.protect);
router
  .route("/")
  .get(reviewscons.getAllReviews)
  .post(
    userauth.restrictTo("user"),
    reviewscons.setUserIdsTourIds,
    reviewscons.makeReview
  );
router
  .route("/:id")
  .get(reviewscons.getReview)
  .delete(userauth.restrictTo("user", "admin"), reviewscons.deleteReview)
  .patch(userauth.restrictTo("user", "admin"), reviewscons.updateReview);
module.exports = router;
