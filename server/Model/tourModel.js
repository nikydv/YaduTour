const mongoose = require('mongoose');

const tourSchema = mongoose.Schema({
    place: {
        type: String,
        required: true,
        unique: true
    },
    price: {
        type: Number,
        required: [true, 'Price field is required']
    },
    rating: {
        type: Number,
        default: 4.5
    }
})

const tourModel = mongoose.model('Tour', tourSchema);

module.exports = tourModel;