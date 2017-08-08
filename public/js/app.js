$(function() {
  // Establish a socket connection w/ the server side app
  var socket = io.connect();
  
  // When a photo has been taken successfully, display a popup with the new image
  socket.on('photoTaken', function (filename) {
    $.magnificPopup.open({
      items: {
        src: '/photos/' + filename
      },
      type: 'image',
      image: { verticalFit: true  },
      closeMarkup: '<button title="%title%" type="button" class="mfp-close"><span class="glyphicon glyphicon-remove"></span></button>'
    }, 0);

    // Enable take photo button again
    $('.take-photo-button').prop('disabled', false);
    // Ensure camera preview is removed from the DOM
    setDefaultBackground();
  });

  // When an error occurs on the server side, display an error and re-enable the take photo button
  socket.on('displayError', function(error){
    $('.take-photo-button').prop('disabled', false);
    setDefaultBackground();
    $('#error-popup .error-message').html(error);
    $.magnificPopup.open({
      items: {
        src: '#error-popup',
        type: 'inline'
      }
    });
  });

  socket.on('cameraPreviewStarted', function(data) {
    console.log('cameraPreviewStarted');
    var previewPort = data.port;
    var appDomain = document.domain;
    $('.camera-stream-contain').css('background-image', 'url("http://' + appDomain + ':' + previewPort  + '/image.jpg")').removeClass('default');
    doCountdown();
  });

  socket.on('cameraPreviewEnded', function(data) {
    console.log('cameraPreviewEnded');
    setDefaultBackground();
  });

  // Set up global vars related to the camera countdown
  window.countdownIndex = null;
  window.countdownInterval = null;
  window.countdownDisplaySeconds = 8;
  window.countdownValues = Array(100).fill(0).map((e,i)=>i+1).reverse();

  // Click handler for take photo button
  $('.take-photo-button').click(function(e){
    e.preventDefault();
    // Disable take photo button
    $(this).prop('disabled', true);
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
          type: 'image',
          image: { verticalFit: true  },
          closeMarkup: '<button title="%title%" type="button" class="mfp-close"><span class="glyphicon glyphicon-remove"></span></button>'
        }, 0);
      }
    });
  });

  // Restart the Pi using a hidden button
  $('#nuke-from-orbit').click(function(e){
    e.preventDefault();
    socket.emit('restartPi');
  });

  // IT'S THE FINAL COUNTDOWN (until a photo is taken)
  function doCountdown(){
    $('.countdown').show();

    window.countdownInterval = window.setInterval(updateCountdown, 80);
  }

  // Called periodicaly while the countdown is running to update the progress bar and # of seconds remaining
  function updateCountdown(){
    if(window.countdownIndex === null){
      window.countdownIndex = 0;
    }
    else{
      window.countdownIndex++;
    }

    var newWidthPercent = window.countdownValues[window.countdownIndex];
    $('.countdown .progress .progress-bar').width(newWidthPercent + '%');
    $('.countdown .seconds-remaining').html(Math.round(newWidthPercent / 12.5));

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

  // Restore the default background image
  function setDefaultBackground(){ 
    var bgImagePath = $('.camera-stream-contain').data('defaultbg');
    $('.camera-stream-contain').css('background-image', 'url("' + bgImagePath  + '")').addClass('default');
  }
});
