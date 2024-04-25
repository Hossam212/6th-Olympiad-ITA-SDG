const express = require('express');
const usercons = require('../../controllers/userscons');
const userauth = require('../../controllers/authcons');
const router = express.Router();
router.use(express.json());
//USER AUTH ROUTES
router.route('/signup').post(userauth.signup);
router.route('/login').post(userauth.login);
router.route('/logout').get(userauth.logout);
router.route('/forgotPassword').post(userauth.forgotPassword);
router.route('/resetPassword/:token').patch(userauth.resetPassword);
router.use(userauth.protect);
router.route('/updatePassword').post(userauth.updatePassword);
//USER DATA ROUTES
router.route('/me').get(usercons.getMe, usercons.getUser);
router.route('/deleteMe').delete(usercons.deleteMe);
router
  .route('/updateMe')
  .patch(
    usercons.uploadUserPhoto,
    usercons.resizeUserPhoto,
    usercons.updateUser
  );
router.use(userauth.restrictTo('admin'));
router.route('/').get(usercons.getAllUsers);
router.route('/:id').patch(usercons.updateUser).delete(usercons.deleteUser);
module.exports = router;
