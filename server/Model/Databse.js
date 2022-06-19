const mongoose = require('mongoose');

    mongoose.connect('mongodb+srv://heyNik:<PASSWORD>cluster0.l0zap.mongodb.net/Tour?retryWrites=true&w=majority',
    {
        useNewUrlParser:true,
        useUnifiedTopology:true
    }
    )

let db = mongoose.connection;

db.on('error', error => {
    console.error('Error in MongoDb connection: ' + error);
      mongoose.disconnect();
});

db.on('connected', () => console.log('Tour Db connected'));
    

