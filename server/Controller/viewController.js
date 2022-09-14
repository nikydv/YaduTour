const tourModel = require('../Model/tourModel');
const appError = require('../Utility/appError');
const User = require('../Model/userModel');


exports.overview = async (req, res, next)=>
{
    try 
    {
        
        const tours = await tourModel.find();
        //console.log('Id: ', tours._id);
        res.status(200).render('overview.pug'
        , {tours, title: 'YaduTour'}
        );
    } catch (error) 
    {
        next(new appError('Getting error in Overview Template', 404));
    }   
}

exports.getTour = async (req, res, next)=>
{
    try 
    {
        //console.log('Inside getTour: ', req.params.id);
        const tour = await tourModel.findById(req.params.id).populate({
            path: 'reviews',
            fields: 'review rating user'
        });

        if(!tour)
        {
            return next(new appError('No tour found!', 404));
        }               

        res.status(200).render('tours.pug'
        , {tour, title: `${tour.name} Tour`}
        );
    } catch (error) 
    {
        console.log(error);
        next(new appError('Getting error! Try after sometime.', 404));
    }
    
}

exports.login = async (req, res, next)=>
{
    try 
    {
        res.status(200).render('login.pug'
        , {title: 'logIn'}
        );    
    } catch (error) {
        console.log(error);
        next(new appError('Getting error in logIn Controller', 404));
    }
}

exports.getAccount = (req, res) => {
    res.status(200).render('account', {title: 'Your Account'})
}
