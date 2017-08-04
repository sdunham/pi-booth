module.exports = function(app){
  var express = require('express');
  var router = express.Router();

  /* GET home page. */
  router.get('/', function(req, res, next) {
    res.render('index', {
      title: 'Pi Photo Booth',
      navText: 'Welcome to our reception!',
      brandImage: app.get('brandImage'),
      backgroundImage: app.get('backgroundImage')
    });
  });

  /* GET JSON array of photo booth filenames */
  router.get('/photoList', function(req, res){
    var fs = require('fs');
    var path = require('path');
    var photoPath = app.get('photoPath');
    var photos = [];

    // TODO: Sort by date desc
    fs.readdir(photoPath, function(err, files){
      for(var i = 0; i < files.length; i++){
        if(path.extname(files[i]) === '.jpg'){
          photos.push({src: '/photos/' + files[i]});
        }
      }

      res.json(photos.reverse());
    });
  });
  
  return router;
};
