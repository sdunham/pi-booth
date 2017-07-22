var spawn = require('child_process').spawn;

var exports = module.exports = {};

// Trigger the start of a preview mjpeg stream from the camera
exports.startPreview = function(){
  return new Promise(function(resolve, reject){

    var mjpegStream = spawn('node', ['node_modules/raspberry-pi-mjpeg-server/raspberry-pi-mjpeg-server.js', '-w', '800', '-l', '480', '-q', '20', '-t', '0']);
  
    var startTimeoutId = setTimeout(function(){
      console.log('startPreview timed out');
      // After 5 seconds, kill the process & reject the promise
      mjpegStream.kill();
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
      mjpegStream.kill();
      reject('An error occurred: ' + data.toString());
    });
  });
};

// Stop the camera preview stream process
exports.stopPreview = function(app){
  var mjpegStream = app.get('mjpegStream');
  if(mjpegStream){
    mjpegStream.kill();
    app.set('mjpegStream', null);
    console.log('mjpegStream process killed');
    // TODO: Is this actually killing the correct process?
    return true;
  }
  else{
    console.log('mjpegStream not set...');
    return false;
  }
};
