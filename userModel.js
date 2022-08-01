const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name:
    {
        type: String,
        required: [true, 'pls tell your name']
    },
    email:
    {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'pls provide valid email']
    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guid', 'admin'],
        default: 'user'
    },
    password: 
    {
        type: String,
        required: [true, 'pls provide your password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: 
    {
        type: String,
        required: [true, 'pls confirm your password'],
        validate: {
            validator: function(el){
                return el===this.password;
            }
        },
        message: 'Password are not same!'
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
})

// userSchema.pre('save', async function(next){
//     if(!this.isModified('password')) return next();

//     this.password = await bcrypt.hash(this.password, 12);

//     this.passwordConfirm = undefined;
//     next();
// });

userSchema.pre(/^find/, function(next){
    this.find({ active: { $ne: false } });
    next();
})

//Instance method:
userSchema.methods.correctPassword = async function(candidatePass, userPass)
{
    return await bcrypt.compare(candidatePass, userPass);
}


userSchema.methods.createPassRsetToken = function() 
{
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    
    console.log("ResetToken: ", resetToken, "passwordResetToken: ", this.passwordResetToken);
    return resetToken;
}

const user = mongoose.model('user', userSchema);

module.exports = user;