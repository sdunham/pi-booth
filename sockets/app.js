var exec = require('child_process').exec;
var camera = require('../camera');

// Handle socket.io connections & related functionality
module.exports = function (io, app) {
  io.on('connection', function (socket) {
    socket.emit('connectionSuccess', { msg: 'Socket connected. Welcome!' });

    // Restart the Pi using a hidden button. Should only be accepted when the request comes dirstly from the Pi
    // TODO: This is kinda terrible, but we need a way to restart the Pi if something goes wrong without yanking the plug. This should be removed if/when a better alternative is found.
    socket.on('restartPi', function(){
      if(socket.handshake.headers.host === 'localhost:3000'){
        exec('sudo shutdown -r now', function(error, stdout, stderr){
          if(error){
            console.log('Error restarting the pi', error);
          }
          else{
            console.log('Pi restarting!');
          }
        });
      }
    });
    
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
