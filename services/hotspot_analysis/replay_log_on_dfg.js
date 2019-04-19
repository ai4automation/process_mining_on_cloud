var fs = require("fs")
var path = require('path');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;

var path = require('path');
var fs = require('fs')
var request = require('request');


var run_py_script = function(timeseries_file_path,dfg_path) {
	return new Promise(function (resolve, reject) {
    var process = spawn('python3',["python/replay_log_on_dfg.py",timeseries_file_path,dfg_path])
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

var replay_log_on_dfg = {
	invoke: function (req, res, next) {
      // show the uploaded file name

      console.log(req.files["activity_timeseries_file"][0]["path"])
      console.log(req.files["dfg_file"][0]["path"])
      timeseries_file_path = req.files["activity_timeseries_file"][0]["path"]
      dfg_path = req.files["dfg_file"][0]["path"]

      run_py_script(timeseries_file_path,dfg_path).then(function(data){
        res.send(data)
      });
	}
}

module.exports = replay_log_on_dfg
