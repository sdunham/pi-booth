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
          socket.emit('displayError', err);
        });
    });

    socket.on('endCameraPreview', function (data) {
      console.log('Received endCameraPreview event:');
      console.log(data);

      var previewStopPromise = camera.stopPreview(app);
      previewStopPromise
        .then(function(){
          socket.emit('cameraPreviewEnded', {});
        })
        .catch(function(err){
          // Something went wrong stopping the preview stream
          console.log('ERROR: ', err);
          socket.emit('displayError', err);
        });
    });

    // Take a photo
    socket.on('takePhoto', function(data){
      console.log('Received takePhoto event:');
      console.log(data);

      // Kill camera preview & take a photo
      var stopPreviewAndTakePhotoPromise = camera.stopPreviewAndTakePhoto(app);
      stopPreviewAndTakePhotoPromise
        .then(function(results){
          socket.emit('photoTaken', results[1])
        })
        .catch(function(err){
          console.log('ERROR: ', err);
          socket.emit('displayError', err);
        });
    });
  });
};
