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
      var mjpegStream = app.get('mjpegStream');
      if(mjpegStream){
        camera.stopPreview(mjpegStream);
        app.set('mjpegStream', null);
        console.log('mjpegStream process killed');
        socket.emit('cameraPreviewEnded', {});
      }
      else{
        console.log('mjpegStream not set...');
      }
    });
  });
};
