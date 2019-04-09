var fs = require("fs")
var path = require('path');
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs')
var request = require('request');


var make_script = function (bpmn_inputs) {
	return new Promise(function (resolve, reject) {

		var sh_logger = fs.createWriteStream("prom/generated_scripts/" + bpmn_inputs.filestring + '.sh', {
			flags: 'a' // 'a' means appending (old data will be preserved)
		})
		sh_logger.on('open', function (fd) {
			sh_logger.write("echo \"String bpmnfilename=\\\"" + bpmn_inputs.filestring + "\\\";\"| cat - template_convert_bpmn2pnml.txt > generated_scripts/" + bpmn_inputs.filestring + "_bpmn2pnml.txt\n");
			sh_logger.write("sh ProM68CLI.sh -f generated_scripts/" + bpmn_inputs.filestring + "_bpmn2pnml.txt\n");
			//	sh_logger.write("cp output_bpmn_files/"+bpmn_inputs.filestring+".bpmn ../public/output_bpmn_files/\n");
			sh_logger.end();
		});
		sh_logger.on("finish", function () {
			exec('cd prom;sh generated_scripts/' + bpmn_inputs.filestring + '.sh' +
				'> logs/' + bpmn_inputs.filestring + '.log' +
				' 2>logs/' + bpmn_inputs.filestring + '.log', (error, stdout, stderr) => {

					console.log(`stdout: ${stdout}`);
					fs.readFile('prom/output_pnml_files/' + bpmn_inputs.filestring + ".pnml", 'utf8', function (err, data) {
						resolve(data)
					});

				});
		})
	});

}

var print_log = function(log_file){
	fs.readFile(log_file, 'utf8', function(err, data) {
		if (err) throw err;
		console.log(data);
	});


}
var convert2pnml = {
	invoke: function (req, res, next) {
		// show the uploaded file name
		var bpmn_inputs = {};
		bpmn_inputs.filestring = path.basename(req.file.filename, path.extname(req.file.filename));
		bpmn_inputs.filename = req.file.filename
		filename = req.file.filename;
		save_path = path.dirname(req.file.path);
		//log_file = save_path+'/../logs/'+bpmn_inputs.filestring+'_derived.log'

		model_file = save_path+'/../input_bpmn_files/'+bpmn_inputs.filestring+'.bpmn'
		make_script(bpmn_inputs).then(function (data) {
			//print_log(log_file);
			res.send(data);
		}).catch(function () {
			print_log(model_file);
			res.send("error in fileupload\n");
		});


	}
}
module.exports = convert2pnml;
