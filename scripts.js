'use strict';

var scripts = require('scripts-plus');
var argv = scripts.argv();

// Define our tasks

scripts.add('default', ['build']);
scripts.add('build', ['build-js']);
scripts.add('test', ['lint', 'karma']);

scripts.add('build-js', ['lint'], function(done) {
  var args = 'modal.js -o dist/modal.js'.split(' ');
  scripts.spawn('browserify', args, logger(done));
});

scripts.add('karma', ['lint'], function(done) {
  scripts.spawn('karma', ['start', 'karma.conf.js'], done);
});

scripts.add('lint', function(done) {
  scripts.spawn('jshint', ['modal.js'], done);
});

scripts.add('clean', ['rm'], function(done) {
  scripts.spawn('mkdir', ['./dist'], logger(done));
});

scripts.add('rm', function(done) {
  scripts.spawn('rm', ['-rf', './dist'], logger(done));
});

scripts.add('server', function(done) {
  var statics = require('node-static');
  var fs = require('fs');
  fs.open('./dist', 'r', function(err) {
    if (err && err.code === 'ENOENT') {
      console.error('./dist does not exist! Run "client build" first.');
    } else {
      var file = new statics.Server('./dist');
      require('http').createServer(function(request, response) {
        request.addListener('end', function() {
          file.serve(request, response);
        }).resume();
      }).listen(8000);
      console.log('Server started on port 8000');
    }
    done(err);
  });
});

// Run the specified task
scripts.run(argv);

function logger(done) {
  return function(err, stdout) {
    if (err) {
      console.error(err); 
    } else {
      console.log(stdout || '.');
    }
    if (done) { done(err); }
  };
}