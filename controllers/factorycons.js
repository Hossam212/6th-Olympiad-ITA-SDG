const appError = require('../utils/newAppError');
const APIFeatures = require('../utils/APIFreatures');
const catchAsync = require('../utils/catchAsync');
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const query = Model.findById(req.params.id);
    if (popOptions) query.populate(popOptions);
    doc = await query;
    if (!doc) {
      return next(
        new appError("can't find the document you're looking for!", 404)
      );
    }
    res.status(200).json({
      status: 'success',
      results: 1,
      data: {
        doc,
      },
    });
  });
exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    const myquery = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .limitFields()
      .sort()
      .paginate();

    const doc = await myquery.query;
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: `success`,
      data: {
        doc,
      },
    });
  });
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(
        new appError("can't find the document you're looking for!", 404)
      );
    }
    res.status(200).json({
      status: `success`,
      data: {
        doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(
        new appError("can't find the document you're looking for!", 404)
      );
    }
    res.status(204).json({
      status: `success`,
      data: null,
    });
  });
