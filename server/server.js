'use strict';
require('../bower_components/closure-library/closure/goog/bootstrap/nodejs');
goog.require('goog.array');
goog.require('goog.string');
var grunt = require('grunt');

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var fs = require("fs");

var request = require('request');


var plovrVars = require('./../tasks/util/get-plovr-vars.js');
var plovrIds = plovrVars.plovrIds;

// use livereload middleware
//app.use(require('grunt-contrib-livereload/lib/utils').livereloadSnippet);

app.use('/client/src/', function(req, res, next) {
  var filePath = 'client/src/' + req.path;
  if(goog.string.endsWith(req.path, '.html') && fs.existsSync(filePath)) {
    var cnt = fs.readFileSync(filePath);
    cnt += "";
    cnt = cnt.replace(/^(.*<link.* href=['"])([^'"]+)(['"].*\/(link)?>.*$)/gmi,
        function(match, prePath, path, postPath) {
          // CSS
          if(path.indexOf('http://localhost:9810/css/')===0) {
            var plovrId = path.substring(26, path.length-1);
            if(goog.string.caseInsensitiveEndsWith(plovrId, '-debug')) {
              plovrId = plovrId.substring(0, plovrId.length-6);
            }
            var plovrConfig = grunt.file.readJSON(plovrIds[plovrId]);
            var srcCssFiles = plovrConfig['css-inputs'];
            var result = srcCssFiles.join(postPath + "\n" + prePath);
            result = prePath + result + postPath;
          } else {
            result = match;
          }
          return result;
        });
    
    res.set('Content-Type', 'text/html');
    res.send(cnt);
  } else {
    next();
  }
});

app.use('/', express.static(__dirname+'/../'));

app.listen(9000, function() {
  console.log("Server is up");
});

