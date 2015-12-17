#!/usr/bin/env node
var exec = require('child_process').exec;
var Orchestrator = require('orchestrator');
var argv = require('yargs').argv;
var task = argv._[0] || 'default';
var args = argv._.slice(1);
var opts = {env: Object.assign(process.env, {PATH: process.env.PATH})};
var tasks = new Orchestrator();

// Define our tasks

tasks.add('default', ['build']);
tasks.add('build', ['build-js']);
tasks.add('test', ['lint', 'karma']);

tasks.add('build-js', ['lint'], function(done) {
  var cmd = 'browserify modal.js > dist/modal.js';
  exec(cmd, opts, logger(done));
});

tasks.add('karma', ['lint'], function(done) {
  spawner('karma', ['start', 'karma.conf.js'], done);
});

tasks.add('lint', function(done) {
  var cmd = 'jshint client/**.js';
  exec(cmd, opts, logger(done));
});

tasks.add('clean', ['rm'], function(done) {
  exec('mkdir ./dist', opts, logger(done));
});

tasks.add('rm', function(done) {
  exec('rm -rf ./dist', opts, logger(done));
});

tasks.add('server', function(done) {
  var static = require('node-static');
  var fs = require('fs');
  fs.open('./dist', 'r', function(err) {
    if (err && err.code === 'ENOENT') {
      console.error('./dist does not exist! Run "client build" first.');
    } else {
      var file = new static.Server('./dist');
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
tasks.start(task, function(err) {
  if (err) {
    console.error(task, err); 
  } else {
    console.log(task, 'completed!');
  }
});

function spawner(bin, args, done) {
  var spawn = require('child_process').spawn;
  var cmd  = spawn(bin, args || []);
  var buffLog = function(data) { console.log(''+data); };

  cmd.stdout.on('data', buffLog);
  cmd.stderr.on('data', buffLog);
  cmd.on('exit', function(code) {
    console.log('exit code: ' + code);
    if (typeof done === 'function') done();
  });
}

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