const reviewModel = require('../Model/reviewModel');
const AppError = require('../Utility/appError');
const factory = require('./handlerFactory');

exports.getAllReviews = async (req, res) => {
        try {
            //console.log('Inside all reviews');
           const reviews = await reviewModel.find()

           res.status(200).json({
            status: 'sucess',
            total: reviews.length,
            data: {
                reviews
            }
           }); 

        } catch (error) {
            new AppError('Error getting All review.', 404);
        }
}

exports.createReview = async (req, res) => {
    try {
        
        const newReview = await reviewModel.create(req.body);
        console.log("newReview: ", newReview);
        res.status(201).json({
            status: 'sucess',
            data: {
                newReview
            }
           }); 

    } catch (error) {
        new AppError('Getting Error  while creating new review.', 404);
    }
}

exports.getReview = factory.getOne(reviewModel);
exports.deleteReview = factory.deleteOne(reviewModel);
exports.updateReview = factory.updateOne(reviewModel);