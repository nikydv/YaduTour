const AppError = require('../Utility/appError');

exports.deleteOne = Model =>
 async (req, res, next) => {

    try 
    {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
          return next(new AppError('No document found with that ID', 404));
        }

        res.status(204).json({
        status: 'success',
        data: null
        });

    } catch (error) 
    {
        return next(new AppError('Getting error while deleting review: ', 404));
    }    
};


exports.updateOne = Model =>
  async (req, res, next) => {
    try 
    {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
          });
      
          if (!doc) {
            return next(new AppError('No document found with that ID', 404));
          }
      
          res.status(200).json({
            status: 'success',
            data: {
              data: doc
            }
          });

    } catch (error) 
    {
        next(new AppError('Getting error while updating Review: ', 404));
    }
    
};

exports.getOne = (Model, popOptions) => 
    async (req, res, next) => {
        
        try 
       {
           let query = Model.findById(req.params.id);
           if(popOptions)
           {
            query = query.populate(popOptions);
           }
           const doc = await query;

           if(!doc)
           {
            return next(new AppError('No document found for thi ID', 404));
           }

           res.status(200).json({
            status: 'success',
            data: {
                data: doc
            }
           })
       } catch (error) 
       {
           next(new AppError('No document found for this ID', 404));
       }
    }
    
