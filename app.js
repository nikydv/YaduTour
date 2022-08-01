require('./server/Model/Databse');

const AppError = require('./server/Utility/appError');
const errControlHandler = require('./server/Controller/errorController');

const tourRoutes = require('./server/Route/tourRoutes');
const usersRoutes = require('./server/Route/userRoutes');
const reviewRoutes = require('./server/Route/reviewRoutes');

const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'server/Views'));

//1) Global Middlewares:
//Serving static files:
app.use(express.static(path.join(__dirname, 'server/Public')));

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
app.get('/', (req, res)=>{
    res.status(200).render('base');
})

app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/user', usersRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.all('*', (req, res, next)=>{
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});


//Global Error handling middleware:
app.use(errControlHandler);

app.listen(3000, ()=>
{
    console.log('Server running at port: 3000');
})