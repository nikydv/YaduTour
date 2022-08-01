const crypto = require('crypto');
const User = require('../Model/userModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const AppError = require('../Utility/appError');
const sendMail = require('../Utility/mail');

const signToken = id => {
    return jwt.sign({id: id}, 'This-is-my-SECRETKey-for-securityy');
}

const createSendToken = (user, statusCode, res) =>
{
    const token = signToken(user._id);
    //const time = Date.now() + process.env.JWT_Cookie_ExpiresIn * 24 * 60 * 60 * 1000;
    const cookieOptions = {
        expires: new Date(Date.now() + 10 * 60 * 1000),
        httpOnly: true
    };

    res.cookie('jwt', token, cookieOptions);
    user.active = undefined;
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.signUp = async (req, res)=>{
    try {
        //const newUser = await User.create(req.body);
        const newUser =  await User.create({
            name: req.body.name,
            email:req.body.email,
            role:req.body.role,
            password:req.body.password,
            passwordConfirm:req.body.passwordConfirm
        });    

        // res.status(202).json({
        //     status: "success",
        //     token,
        //     data: {
        //         user: newUser
        //     }
        // })
        
        createSendToken(newUser, 202, res);

    } catch (error) {
        console.log("Error: "+error);
        res.status(404).json({message: "Error inserting new user data"});
    }
}

exports.allUsers = async(req, res)=>{
    try {
        const data = await User.find();
        res.status(202).json({
            status: 'success',
            total: data.length,
            userData: {
             data: data
            }
        })
    } catch (error) {
        res.status(404).json({message: "Error getting all user data"});
    }
}

exports.logIn = async (req, res, next)=>{
    try {

        const { email, password } = req.body;
        // console.log("Body: ", req.body)

    //1. Check if id nd pass exist
    if(!email || !password)
    {
        return next(new AppError('Pls provide email and password', 400));
    }
    
    //2. Check if id and password exists in Database:
    const user = await User.findOne({ email }).select('+password');
    //console.log("User: ", user);

    if(!user || !(await user.correctPassword(password, user.password)))
    {
        return next(new AppError('Incorrect email or password', 400));
    }

    //3. if all ok send token to client:
    // const token = signToken(user._id);
    // res.status(200).json({
    //     status: 'success',
    //     token
    // })

    createSendToken(user, 200, res);

    } catch (error) {
        next(new AppError('Something wrong while logginIn', 400));
    }
    
}

exports.protect = async (req, res, next)=>{
    try 
    {
        let Token;
       //1. get Token nd check if exist:
       if(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
       {
        Token = req.headers.authorization.split(' ')[1];
       }
       //console.log("Token: "+Token);
       if(!Token)
       {
           return next(new AppError('Pls logIn first, to get access', 400));
       }

       //2. Validate Token:
       const decoded = await promisify(jwt.verify)(Token, 'This-is-my-SECRETKey-for-securityy');
       console.log(decoded);

       //3. Check if user exist:
       const freshUser = await User.findById(decoded.id);
       if(!freshUser)
       {
           return next(new AppError("user for token doesn't exist", 401));
       }
       
       //4. if user changed pass after receiving token:
       req.user = freshUser;
       next();
    } catch (error) 
    {
        if(error.name='ValidationError')
        {
            next(new AppError('Invalid token, pls login again!', 401));
        }else if(error.name='JsonWebTokenError')
        {
            next(new AppError('Token expired, pls login Again', 401));
        }else{
            next(new AppError('Error while authenticating the token', 400));
        }
       
    }
} 

exports.restictTo = (...roles) => {
    return (req, res, next) => {
        //roles=['admin', 'lead-admin']   
        if(!roles.includes(req.user.role))
        {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    }
}

exports.forgotPassword = async (req, res, next) => {
     //1. get user fron email:
          const user = await User.findOne( {email: req.body.email} );
          if(!user)
          {
              return next(new AppError('There is no email with email address.', 404));
          }

     //2. generate random token:
        const resetToken = user.createPassRsetToken();
        await user.save({ validateBeforeSave: false }); 

     //3. send to user's email id:
        const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

        const message = `Forgot password ? submit path request with you new password and password confirm
                         to: ${resetUrl}. If you didn't forget your password, pls ignore this email.`;
        
        try {
            await sendMail({
                email: user.email,
                subject: 'Your password reset token(Valid for 10 mins)',
                message
            }) 
            
            // res.status(200).json({
            //     status: 'success',
            //     message: 'Token sent to email'
            // });

            createSendToken(user, 200, res);

        } catch (error) {
            console.log("Error: ", error);
            //user.passwordResetToken = undefined;
            //user.passwordResetExpires = undefined;
            //await user.save({validateBeforeSave: false});

            return next( new AppError('There was error sending mail, try again later!', 500) );
        }                 
        
}

exports.resetPassword = async (req, res, next) => {
    //1. get user based on token:
        const hashedToken = crypto
                        .createHash('sha256')
                        .update(req.params.token)
                        .digest('hex');
        const user = await User.findOne({
            passwordResetToken: hashedToken, 
            passwordResetExpires: { $gt: Date.now() }
        });

    //2. if token not expired and there is user then set new password:
         if(!user)
         {
             return next( new AppError('Invalid Token or Expired', 400));
         }
        
    //3. Update changePaswordAt in database:
        user.password = req.body.password;
        user.passwordConfirm = req.body.passwordConfirm;
        user.passwordChangedAt = Date.now();
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

    //4. Log the user in, send JWT:
        //const token = signToken(user._id);

        // res.status(202).json({
        //    status: "success",
        //    token,
        //    data: {
        //        user: user
        //    }
        // })

        createSendToken(user, 202, res);

}

exports.updatePassword = async (req, res, next) => {
    //1. Get user from collection:
        const {email, password, newPassword} = req.body;
        const user = await User.findOne({email: email}).select('+password');

        if(!email || !password || !newPassword)
        {
            return next(new AppError('Pls provide email and/or password', 400));
        }

    //2. Check if posted current password in correct:
        if(!user || !(await user.correctPassword(password, user.password)))
        {
            return next(new AppError('Incorrect email or password', 400));
        }

    try {
        //3. if so update pass:
        user.password = newPassword;
        user.passwordConfirm = newPassword;
        user.passwordChangedAt = Date.now();
        await user.save();

       //4. log in user and send JWT:
    //    const token = signToken(user._id);
    //    res.status(200).json({
    //        status: 'success',
    //        message: 'Password updated successfully',
    //        token,
    //        userData: {
    //            user
    //        }
    //     });

    createSendToken(user, 200, res);

    } catch (error) {
        next(new AppError('Errror while updating password', 404));
    }
}

exports.deleteMe = async (req, res, next) => {
    try 
    {
        await User.findByIdAndUpdate(req.user.id, { active:false });
        // res.status(200).json({
        //     status: 'success',
        //     data: null
        // });

        createSendToken(null, 202, res);

    } catch (error) {
        console.log(error);
        next(new AppError('Error deleting user', 404));
    }
}