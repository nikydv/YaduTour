const tourModel = require('../Model/tourModel');
const AppError = require('../Utility/appError');


exports.createTour =  async (req, res, next)=>{
    try {
        const data = await tourModel.create(req.body);
        res.status(200).send({           
            result: 'Success',
            Message: data
        })
    } catch (error) {
        // res.status(400).send({
        //     result: 'failure',
        //     message: error
        // })
        console.log(error);
        next(new AppError('Error while creating new Tour in database: '), 404); 
    }
}

exports.getAllTours = async (req, res, next)=>{
    try {
        const tours = await tourModel.find({});

        res.status(200).send({
            status: 'Success',
            records: tours.length,
            data: {
                tours
            }
        })
    } catch (error) {
        
        // res.status(404).send({
        //     status: 'Failure',
        //     message: 'Error getting all tour.'
        // })
        next(new AppError('Error while loading all tour data: '), 404); 
    }
}

exports.getTour = async (req, res, next)=>{
    try {
        const tourData = await tourModel.findById(req.params.id);

        res.status(200).send({
            status: 'Success',
            data: {
                tourData
            }
        })
    } catch (error) {
        
        // res.status(404).send({
        //     status: 'Failure',
        //     message: error
        // })
        console.log(error);
        next(new AppError(`Error while getting tour ${req.params.id}: `), 404); 
    }
}

exports.deleteTour = async(req, res, next)=>{
   try {
    const Deltour = await tourModel.findByIdAndDelete(req.params.id);

    if (!Deltour) {
      return next(new AppError(`No tour found with that ID: ${req.params.id}`, 404));
    }
  
    res.status(204).json({
      status: 'success',
      data: null
    });

   } catch (error) {
       console.log(error);
      next(new AppError('Error while deleting tour: '), 404); 
   }
}
