var Promise = require("bluebird");
var spawn = require('child_process').spawn;
var RaspiCam = require("raspicam");

// Trigger the start of a preview mjpeg stream from the camera
var startPreview = function(){
  return new Promise(function(resolve, reject){
    var mjpegStream = spawn('node', ['node_modules/raspberry-pi-mjpeg-server/raspberry-pi-mjpeg-server.js', '-w', '800', '-l', '480', '-q', '20', '-t', '0'], {detached: true});
  
    var startTimeoutId = setTimeout(function(){
      console.log('startPreview timed out');
      // After 5 seconds, kill the process & reject the promise
      //mjpegStream.kill();
      process.kill(-mjpegStream.pid);
      reject('startPreview timed out');
    }, 5000);

    // Watch the output of the child process output for the text "raspistill" and resolve if/when it occurs
    mjpegStream.stdout.on('data', (data) => {
      // Check if the output contains the string "raspistill" and resolve the promise if found
      var output = data.toString();
      console.log('Checking:', output);
      if(output.indexOf('raspistill') > -1){
        clearTimeout(startTimeoutId);
        console.log('startPreview succeeded');
        resolve(mjpegStream);
      }
    });

    // If an error occurs, reject the promise
    mjpegStream.stderr.on('data', (data) => {
      clearTimeout(startTimeoutId);
      console.log('error:', data.toString());
      // If an error occurred, kill the child process & reject the promise
      //mjpegStream.kill();
      process.kill(-mjpegStream.pid);
      reject('An error occurred: ' + data.toString());
    });
  });
};

// Stop the camera preview stream process, and return a promise
var stopPreview = function(app){
  return new Promise(function(resolve, reject){
    // After 5 seconds, reject the promise
    var killTimeoutId = setTimeout(function(){
      reject('An error occurred: Unable to stop camera preview');
    }, 5000);

    var mjpegStream = app.get('mjpegStream');
    if(mjpegStream){
      mjpegStream.on('close', function(code, signal){
        console.log('stopPreview close event', code, signal);
        app.set('mjpegStream', null);
        clearTimeout(killTimeoutId);
        setTimeout(function(){
          resolve();
        }, 500);
      });

      //mjpegStream.kill('SIGTERM');
      process.kill(-mjpegStream.pid);
    }
    else{
      reject('An error occurred: No camera preview process found to stop');
    }
  });
};

// Trigger a photo to be taken, and return a promise
var takePhoto = function(){
  return new Promise(function(resolve, reject){
    // Configure RaspiCam library to take a single photo
    var raspiCamera = new RaspiCam({
      mode: 'photo',
      output: process.cwd() + '/photos/'+Date.now()+'.jpg',
      width: 800,
      height: 600,
      quality: 50,
      timeout: 0,
      encoding: 'jpg',
      nopreview: true
    });

    // After 5 seconds, reject the promise
    var photoTimeoutId = setTimeout(function(){
      console.log('takePhoto timed out');
      reject('An error occurred: Photo capture timed out');
    }, 5000);

    // Wait for read events, and resolve/reject the promise based on the result
    raspiCamera.on('read', function(err, timestamp, filename){
      if(err){
        clearTimeout(photoTimeoutId);
        reject('An error occurred: ' + err);
      }
      else if(filename){
        clearTimeout(photoTimeoutId);
        resolve(filename);
      }
    });

    // Take a picture
    raspiCamera.start();
  });
};

var stopPreviewAndTakePhoto = function(app){
  return Promise.mapSeries([stopPreview, takePhoto], function(fn){
    console.log('mapSeries function: ', fn);
    return fn(app);
  });
};

var exports = module.exports = {
  startPreview: startPreview,
  stopPreview: stopPreview,
  takePhoto: takePhoto,
  stopPreviewAndTakePhoto: stopPreviewAndTakePhoto
};
