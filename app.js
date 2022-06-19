require('./server/Model/Databse');

const AppError = require('./server/Utility/appError');
const errControlHandler = require('./server/Controller/errorController');

const tourRoutes = require('./server/Route/tourRoutes');
const usersRoutes = require('./server/Route/userRoutes');

const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

//Setting up security:
app.use(helmet());
const limiter = rateLimit({
    max: 100,
    window: 60 * 60 * 1000,
    message: 'Too many requests, pls try in an hour!'
});
app.use('/api', limiter);


//Body Parser:
app.use(express.json({limit: '10kb'}));

//Data sanitization againt no sql query Injection:
app.use(mongoSanitize());

//Data sanitization againt XSS:
app.use(xss());

//Prevent parameter pollution:
app.use(hpp());

//Routes:
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/user', usersRoutes);
app.all('*', (req, res, next)=>{
    // res.status(404).json({
    //     status:'Fail',
    //     Message: `cann't find ${req.originalUrl} on server`
    // })
    
    // let err = new Error(`Can't find ${req.originalUrl} on this server`);
    // err.statusCode = 404;
    // err.status = 'failure';
    // next(err);

    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});


//Global Error handling middleware:
app.use(errControlHandler);

app.listen(3000, ()=>
{
    console.log('Server running at port: 3000');
})