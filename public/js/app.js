$(function() {

  var socket = io.connect('http://ogrepi2:3000');
  socket.on('connectionSuccess', function (data) {
    console.log(data);
    //socket.emit('initCameraPreview', { foo: 'bar' });
  });

  $('.start-stream').click(function(e){
    e.preventDefault();
    socket.emit('initCameraPreview', { foo: 'bar' });
  });

  $('.end-stream').click(function(e){
    e.preventDefault();
    socket.emit('endCameraPreview', { foo: 'bar' });
  });

  socket.on('cameraPreviewStarted', function(data) {
    console.log('cameraPreviewStarted!');
    var previewPort = data.port;
    var appDomain = document.domain;
    $('.camera-stream').attr('src', '#');
    $('.camera-stream-contain').html('<img class="camera-stream" src="" />');
    $('.camera-stream').attr('src', 'http://'+appDomain+':'+previewPort+'/image.jpg');
  });

  socket.on('cameraPreviewEnded', function(data) {
    console.log('cameraPreviewEnded');
    $('.camera-stream-contain').html('<img class="camera-stream" src="" />');
    $('.camera-stream').attr('src', '/images/Transparent.gif');
  });


  window.countdownIndex = null;
  window.countdownInterval = null;
  window.countdownDisplaySeconds = 5;
  window.countdownValues = Array(100).fill(0).map((e,i)=>i+1).reverse();

  // Click handler for take photo button
  $('.take-photo-button').click(function(e){
    e.preventDefault();
    //alert('Eventually this will start a mjpeg stream from the Raspberry Pi camera, and then trigger a photo capture after a certain amount of time.');
    // TODO: Start stream, update div background to show mjpeg
    doCountdown();
  });

  // Click handler for help popup
  $('.help-popup-trigger').magnificPopup({
    type:'inline',
    midClick: true
  });

  function doCountdown(){
    $('.countdown').show();

    window.countdownInterval = window.setInterval(updateCountdown, 50);
  }

  function updateCountdown(){
    if(window.countdownIndex === null){
      window.countdownIndex = 0;
    }
    else{
      window.countdownIndex++;
    }

    var newWidthPercent = window.countdownValues[window.countdownIndex];
    $('.countdown .progress .progress-bar').width(newWidthPercent + '%');
    $('.countdown .seconds-remaining').html(Math.round(newWidthPercent / 20));

    if(window.countdownIndex >= 100){
      endCountdown();
    }
  }

  // TODO: Take a picture
  function endCountdown(){
    clearInterval(window.countdownInterval);
    window.countdownInterval = null;
    window.countdownIndex = null;
    $('.countdown').hide();
    $('.countdown .progress .progress-bar').width('100%');
    $('.countdown .seconds-remaining').html('5');
  }
});
