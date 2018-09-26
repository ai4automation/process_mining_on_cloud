var fs = require("fs")
var path = require('path');
var exec = require('child_process').exec;
var multer = require('multer');
var upload = multer({ dest: 'uploads/' })
var path = require('path');
var fs = require('fs')
var Zip = require('node-7z');



var make_script = function(eventlog_inputs){
	return new Promise(function(resolve,reject){
		var logger = fs.createWriteStream("prom/generated_scripts/"+eventlog_inputs.filestring+'.txt', {
		  flags: 'a' // 'a' means appending (old data will be preserved)
		})
		logger.on('open', function(fd) {
				logger.write("String argStr=\"eventlogs/"+eventlog_inputs.file.filename);
				logger.write(" -trace "+eventlog_inputs.trace_field);
				logger.write(" -event "+eventlog_inputs.event_field);
				logger.write(" -complete "+eventlog_inputs.complete_field);
				logger.write(" -xes xesfiles/"+eventlog_inputs.filestring+".xes.gz\";\n");

				logger.write("String[] args=argStr.split(\" \");\n")
				logger.write("org.processmining.log.csvimport.CSVConversionCLI.main(args);\n");
				logger.end();
		});
		logger.on('finish', function () {
				var sh_logger = fs.createWriteStream("prom/generated_scripts/"+eventlog_inputs.filestring+'.sh', {
				  flags: 'a' // 'a' means appending (old data will be preserved)
				})
				sh_logger.on('open',function(fd){
					sh_logger.write("sh Prom68CLI.sh -f generated_scripts/"+eventlog_inputs.filestring+".txt\n");
					sh_logger.write("7z x -y -oxesfiles xesfiles/"+eventlog_inputs.filestring+".xes.gz\n");
					sh_logger.write("echo \"String xesfilename=\\\""+eventlog_inputs.filestring+"\\\";\"| cat - template_generate_bpmn.txt > generated_scripts/"+eventlog_inputs.filestring+"_bpmn.txt\n");
					sh_logger.write("sh Prom68CLI.sh -f generated_scripts/"+eventlog_inputs.filestring+"_bpmn.txt\n");
				//	sh_logger.write("cp output_bpmn_files/"+eventlog_inputs.filestring+".bpmn ../public/output_bpmn_files/\n");
					sh_logger.end();
				});
				sh_logger.on("finish",function(){
					exec('cd prom;sh generated_scripts/'+eventlog_inputs.filestring+'.sh' +
								'> logs/'+eventlog_inputs.filestring+'.log'+
								' 2>logs/'+eventlog_inputs.filestring+'.log', (error, stdout, stderr) => {

							  console.log(`stdout: ${stdout}`);
								fs.readFile('prom/output_bpmn_files/'+eventlog_inputs.filestring+".bpmn", 'utf8', function (err,data) {
									  resolve(data)
								});

						});
				})

		});

	});

}
var get_bpmn_from_unstructured = {
	invoke: function(req,res,next){
							 // show the uploaded file name
							console.log(req.file.filename)
							var eventlog_inputs = {};
							eventlog_inputs.filestring = path.basename(req.file.filename,path.extname(req.file.filename));

							eventlog_inputs.file = req.file

							filename = req.file.filename;
							eventlog_inputs.trace_field=req.body.caseid;
							eventlog_inputs.event_field=req.body.activity;
							eventlog_inputs.complete_field=req.body.timestamp;
							eventlog_inputs.comments_field=req.body.comments;

							

							make_script(eventlog_inputs).then(function(data){
								res.send(data);
							}).catch(function(){
								res.send("error in fileupload\n");
							});

					}
}
module.exports = get_bpmn_from_unstructured;
