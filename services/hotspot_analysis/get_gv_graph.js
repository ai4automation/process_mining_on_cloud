var fs = require("fs")
var path = require('path');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var path = require('path');
var fs = require('fs')
var request = require('request');


var run_py_script = function(timeseries_file_path,dfg_path) {
	return new Promise(function (resolve, reject) {
    var process = spawn('python3',["python/gml2gvz.py",timeseries_file_path])
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

var get_gv_graph = {
	invoke: function (req, res, next) {
      // show the uploaded file name
      run_py_script(req.file.path).then(function(data){
        res.send(data)
      });
	}
}

module.exports = get_gv_graph
