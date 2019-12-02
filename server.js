require('dotenv').config(); //.env to keep variables private
const express = require('express'); //node web framework
const morgan = require('morgan'); //to check api endpoints
const path = require('path');//node module which lets us access file system
const mongoose = require('mongoose');
const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const crypto = require('crypto')
const app = express();
const port = process.env.PORT || 5000;
const uri = process.env.ATLAS_URI;

app.use(express.urlencoded({ extended: true }));//url encoding parsing middleware
app.use(express.json());//json parsing middleware

app.use(morgan('dev'));//lets you test your endpoints in your console

//serves up static sites when in production environment
if (process.env.NODE_ENV === "production") {
    app.use(express.static("client/build"));
}
// connection to database
mongoose.connect(uri, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  });
  const connection = mongoose.connection;
  let gfs;

  connection.once('open', () => {
    gfs = Grid(connection.db, mongoose.mongo);
    gfs.collection("uploads");
    console.log("MongoDB connection is live");
})

// Create storage engine
const storage = new GridFsStorage({
    url: uri,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err)
          }
          const filename = file.originalname
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads',
          }
          resolve(fileInfo)
        })
      })
    },
  })
  
  const upload = multer({ storage })

  app.post('/', upload.single('img'), (req, res, err) => {
    res.send(req.files);
  })

  app.get('/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file
      if (!file || file.length === 0) {
        return res.status(404).json({
            responseCode: 1,
            responseMessage: "error"
        });
      }
  
      // Check if file is image 
      if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
        // 
        const readstream = gfs.createReadStream(file.filename)
        readstream.pipe(res)
      } else {
        res.status(404).json({
          err: 'Not an image',
        })
      }
    })
  })

  app.delete('/:filename', (req, res) => {
    try {
      gfs.files.deleteOne({ filename: req.params.filename }, (err, file) => {
           // Check if file
      if (!file || file.length === 0) {
        return res.status(404).json({
            responseCode: 1,
            responseMessage: "error"
        });
      }
  
      // Check if file is image 
      if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
        // 
        const readstream = gfs.createReadStream(file.filename)
        readstream.pipe(res)
      } else {
        res.status(404).json({
          err: 'Not an image',
        })
      }
    })
    }
    catch(err) {
      console.log(err)
    } 
  })

  app.get('/api/files', (req, res) => {
      let filesData = [];
      let count = 0;

      gfs.files.find({}).toArray((err, files) => {
        //   if(!files || files.length === 0){
        //     return res.status(404).json({
        //         err: 'No file exists',
        //       });
        //   }
        files.forEach((file) => {
            filesData[count++] = {
                filename: file.filename,
                contentType: file.contentType
            }
        });
        
        res.json(filesData);
      })
  })

//connects api routes
const apiRoutes = require('./routes/apiRoutes');
app.use('/api', apiRoutes);

//sends files to the react app
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

//console logs when server is up and running
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
