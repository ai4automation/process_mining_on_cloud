var fs = require("fs")
var path = require('path');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var path = require('path');
var fs = require('fs')
var request = require('request');


var run_py_script = function(timeseries_file_path) {
	return new Promise(function (resolve, reject) {
    var process = spawn('python3',["python/trie_representation.py",timeseries_file_path])
    console.log("Started python process")
    dataString = '';
    process.stdout.on('data', function(data){
      dataString += data.toString();
    });

    process.stdout.on('end', function() {
        resolve(dataString);
    } )
	});
}

var learn = {
	invoke: function (req, res, next) {
      // show the uploaded file name
    console.log(req.file.path)
    run_py_script(req.file.path).then(function(data){
      res.send(data)
    });
	}
}

module.exports = learn
