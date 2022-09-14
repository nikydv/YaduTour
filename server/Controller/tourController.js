const tourModel = require('../Model/tourModel');
const AppError = require('../Utility/appError');
const factory = require('./handlerFactory');
const sharp = require('sharp');
const multer = require('multer');



const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

// upload.single('image') req.file
// upload.array('images', 5) req.files

exports.resizeTourImages = async (req, res, next) => {
  try 
  {
    console.log('Cover: ', req.files.imageCover, 'Image: ', req.files.images)
    if (!req.files.imageCover || !req.files.images) return next();

  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`server/Public/img/tours/${req.body.imageCover}`);

  // 2) Images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`server/Public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();

  } catch (error) 
  {
    next(new AppError('Error while updating tourImages in database: '), 404); 
   
  }}
  



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
        //console.log(error);
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

exports.updateTour = factory.updateOne(tourModel);
