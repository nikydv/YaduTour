const User = require('../Model/userModel');
const AppError = require('../Utility/appError');
const factory = require('./handlerFactory');
const sharp = require('sharp');
const multer = require('multer');


// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'server/Public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if(file.mimetype.startsWith('image'))
  {
    cb(null, true);
  }else{
    cb(new AppError('Not an image! Please upload only image', 400), false);
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
  if(!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  sharp(req.file.buffer)
   .resize(500, 500)
   .toFormat('jpeg')
   .jpeg({ quality:90 })
   .withMetadata()
   .toFile(`server/Public/img/users/${req.file.filename}`);
  
  next(); 
}

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
      if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
  };


exports.updateMe = async (req, res, next) => {
  try
  {  
    console.log(req.file);
    console.log(req.body);
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /updateMyPassword.',
          400
        )
      );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
 
  console.log("User: ", req.user);
  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
 
}catch(error)
{
    next(new AppError(error,  404));    
}}    