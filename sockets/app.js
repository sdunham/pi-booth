var camera = require('../camera');

// Handle socket.io connections & related functionality
module.exports = function (io, app) {
  io.on('connection', function (socket) {
    socket.emit('connectionSuccess', { msg: 'Socket connected. Welcome!' });
    
    socket.on('initCameraPreview', function (data) {
      // Start a preview mjpeg stream of the camera, returned as a Promise
      var mjpegStreamPromise = camera.startPreview();
      mjpegStreamPromise
        .then(function (process) {
          // The preview stream has been started
          console.log('Camera preview promise resolved successfully');
          app.set('mjpegStream', process);
          socket.emit('cameraPreviewStarted', {port: 8080});
        })
        .catch(function (err) {
          // Something went wrong starting the preview stream
          console.error('ERROR: ', err);
        });
    });

    socket.on('endCameraPreview', function (data) {
      console.log('Received endCameraPreview event:');
      console.log(data);

      var previewStopped = camera.stopPreview(app);
      socket.emit('cameraPreviewEnded', {});
    });

    // Take a photo
    socket.on('takePhoto', function(data){
      console.log('Received takePhoto event:');
      console.log(data);

      // Kill camera preview process if applicable
      var previewStopped = camera.stopPreview(app);
      // Trigger a photo to be taken and saved locally
      var takePhotoPromise = camera.takePhoto();
      takePhotoPromise
        .then(function (file) {
          // The photo was taken
          console.log('Take photo promise resolved successfully', file);
          //socket.emit('photoTaken', {photo: file});
        })
        .catch(function (err) {
          // Something went wrong taking the photo
          console.error(err);
        });
    });
  });
};
