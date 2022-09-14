const mongoose = require('mongoose');
const User = require('./userModel');

const tourSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have name'],
        trim: true,
        unique: true,
        maxlength: [30, 'Tour name must have <= 30 characters'],
        minlength: [10, 'Tour name mut have >= 10 characters']
    },
    duration: {
        type: Number,
        required: [true, 'Duration is necessary']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'group size is necessary']
    },
    difficulty: {
        type: String,
        required: [true, 'A should have difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty should be either easy, medium or difficult'
        }
    },
    ratingAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating should be >=1'],
        max: [5, 'RAting should be <=5'],
        set: val => Math.round(val*10)/10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: ['true', 'A tour must have price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val){
                return val<this.price; 
            },
        message: 'Discount price ({VALUE}) should be below regular price'    
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour should have cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        //GeoLocation:
        type: {
            type: String,
            default: 'point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'point',
                enum: ['Point'] 
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'user'
        }
    ]},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
      }
    );

//Document middleware: run before save and create:
//To embed user data:
// tourSchema.pre('save', async function(next){
//     const guidsePromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidsePromises);

//     next();
// })

tourSchema.pre(/^find/, function(next){
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt'
    });

    next();
})

// Virtual populate
tourSchema.virtual('reviews', {
    ref: 'Reviews',
    foreignField: 'tour',
    localField: '_id'
  });

tourSchema.index({ price:1 })  

const tourModel = mongoose.model('Tour', tourSchema);

module.exports = tourModel;
