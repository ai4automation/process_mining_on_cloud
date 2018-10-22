var fs = require("fs")
var path = require('path');
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs')
var request = require('request');

//var clustering_url = 'http://process-demo.sl.cloud9.ibm.com';
var clustering_url = 'https://rtp2.cloud.boomerangplatform.net/ccspd/dev/textclustering';
var make_script = function (eventlog_inputs) {
	return new Promise(function (resolve, reject) {
		var logger = fs.createWriteStream("prom/generated_scripts/" + eventlog_inputs.filestring + '.txt', {
			flags: 'a' // 'a' means appending (old data will be preserved)
		})
		logger.on('open', function (fd) {
			logger.write("String argStr=\"eventlogs/" + eventlog_inputs.filename);
			logger.write(" -trace " + eventlog_inputs.trace_field);
			logger.write(" -event " + eventlog_inputs.event_field);
			logger.write(" -complete " + eventlog_inputs.complete_field);
			logger.write(" -xes xesfiles/" + eventlog_inputs.filestring + ".xes.gz\";\n");

			logger.write("String[] args=argStr.split(\" \");\n")
			logger.write("org.processmining.log.csvimport.CSVConversionCLI.main(args);\n");
			logger.end();
		});
		logger.on('finish', function () {
			var sh_logger = fs.createWriteStream("prom/generated_scripts/" + eventlog_inputs.filestring + '.sh', {
				flags: 'a' // 'a' means appending (old data will be preserved)
			})
			sh_logger.on('open', function (fd) {
				sh_logger.write("sh ProM68CLI.sh -f generated_scripts/" + eventlog_inputs.filestring + ".txt\n");
				sh_logger.write("7z x -y -oxesfiles xesfiles/" + eventlog_inputs.filestring + ".xes.gz\n");
				sh_logger.write("echo \"String xesfilename=\\\"" + eventlog_inputs.filestring + "\\\";\"| cat - template_generate_bpmn.txt > generated_scripts/" + eventlog_inputs.filestring + "_bpmn.txt\n");
				sh_logger.write("sh ProM68CLI.sh -f generated_scripts/" + eventlog_inputs.filestring + "_bpmn.txt\n");
				//	sh_logger.write("cp output_bpmn_files/"+eventlog_inputs.filestring+".bpmn ../public/output_bpmn_files/\n");
				sh_logger.end();
			});
			sh_logger.on("finish", function () {
				exec('cd prom;sh generated_scripts/' + eventlog_inputs.filestring + '.sh' +
					'> logs/' + eventlog_inputs.filestring + '.log' +
					' 2>logs/' + eventlog_inputs.filestring + '.log', (error, stdout, stderr) => {

						console.log(`stdout: ${stdout}`);
						fs.readFile('prom/output_bpmn_files/' + eventlog_inputs.filestring + ".bpmn", 'utf8', function (err, data) {
							resolve(data)
						});

					});
			})

		});

	});

}

var print_log = function(log_file){
	fs.readFile(log_file, 'utf8', function(err, data) {  
		if (err) throw err;
		console.log(data);
	});
	

}
var get_bpmn = {
	invoke: function (req, res, next) {
		// show the uploaded file name
		var eventlog_inputs = {};
		eventlog_inputs.filestring = path.basename(req.file.filename, path.extname(req.file.filename));
		eventlog_inputs.filename = req.file.filename
		filename = req.file.filename;
		save_path = path.dirname(req.file.path);
		log_file = save_path+'/../logs/'+filename+'_derived.log'
		eventlog_inputs.trace_field = req.body.caseid;
		eventlog_inputs.complete_field = req.body.timestamp;
		if ("comments" in req.body && req.body.comments != undefined) {
			request.post({
				url: clustering_url+'/event_clustering/cluster',
				formData: {
					'file': fs.createReadStream(req.file.path)
				},
				qs: {
					'comments': req.body.comments,
					'action': req.body.activity
				}
			}, function (error, response, body) {
				if (error) {
					console.log('error: ' + error)
					print_log(log_file);
					res.send(error)
				} else {
					if (body == undefined)
						res.json({ 'error': 'Error in clustering.' })
					download_path = JSON.parse(body)
					console.log('get url: '+ clustering_url + download_path.download_url);
					request.get({
						url: clustering_url + download_path.download_url,

					}, function (error, response, csvdata) {
						if (error) {
							console.log('error: ' + error);
							print_log(log_file);
							res.send(error);
						} else {
							
							derived_file = path.join(save_path, eventlog_inputs.filestring + '_derived.csv');
							eventlog_inputs.filestring = eventlog_inputs.filestring + '_derived';
							eventlog_inputs.event_field = 'DERIVED_ACTION';
							eventlog_inputs.filename = eventlog_inputs.filestring + '.csv';
							console.log(derived_file);
							var fs = require('fs');
							fs.writeFile(derived_file, csvdata, function (err) {
								if (err) {
									console.log('error: ' + err);
									print_log(log_file);
									res.send(err);
								}
								make_script(eventlog_inputs).then(function (data) {
									console.log(data);
									print_log(log_file);
									res.send(data);
								}).catch(function () {
									console.log('error in fileupload\n');
									print_log(log_file);
									res.send("error in fileupload\n");
								});
							});

						}
					});

				}
			});
		} else {
			eventlog_inputs.event_field = req.body.activity;
			make_script(eventlog_inputs).then(function (data) {
				print_log(log_file);
				res.send(data);
			}).catch(function () {
				print_log(log_file);
				res.send("error in fileupload\n");
			});
		}

	}
}
module.exports = get_bpmn;
