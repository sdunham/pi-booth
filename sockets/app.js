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

    // TODO
    socket.on('takePhoto', function(data){
      console.log('Received takePhoto event:');
      console.log(data);

      // TODO: Kill camera preview process if applicable
      // TODO: Take a photo & save it locally
      // TODO: Emit a socket event w/ new image to display on front end
    });

  });
};
