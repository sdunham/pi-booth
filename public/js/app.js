$(function() {

  var socket = io.connect('http://ogrepi2:3000');
  
  // When a photo has been taken successfully, display a popup with the new image
  socket.on('photoTaken', function (filename) {
    $.magnificPopup.open({
      items: {
        src: '/photos/' + filename
      },
      type: 'image'
    }, 0);
  });

  socket.on('cameraPreviewStarted', function(data) {
    console.log('cameraPreviewStarted');
    var previewPort = data.port;
    var appDomain = document.domain;
    $('.camera-stream-contain').css('background-image', 'url("http://' + appDomain + ':' + previewPort  + '/image.jpg")');
    doCountdown();
  });

  socket.on('cameraPreviewEnded', function(data) {
    console.log('cameraPreviewEnded');
    $('.camera-stream-contain').css('background-image', '');
  });


  window.countdownIndex = null;
  window.countdownInterval = null;
  window.countdownDisplaySeconds = 5;
  window.countdownValues = Array(100).fill(0).map((e,i)=>i+1).reverse();

  // Click handler for take photo button
  $('.take-photo-button').click(function(e){
    e.preventDefault();
    // Start stream, update div background to show mjpeg
    socket.emit('initCameraPreview');
  });

  // Click handler for help popup
  $('.help-popup-trigger').magnificPopup({
    type:'inline',
    midClick: true
  });

  // Click handler for gallery popup
  $('.photo-gallery-popup-trigger').click(function(e){
    e.preventDefault();
    $.get('/photoList', function(photos){
      if(photos.constructor === Array){
        $.magnificPopup.open({
          items: photos,
          gallery: {enabled: true},
          type: 'image'
        }, 0);
      }
    });
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

  // Take a picture
  function endCountdown(){
    clearInterval(window.countdownInterval);
    window.countdownInterval = null;
    window.countdownIndex = null;
    $('.countdown').hide();
    $('.countdown .progress .progress-bar').width('100%');
    $('.countdown .seconds-remaining').html('5');
    socket.emit('takePhoto');
  }
});
