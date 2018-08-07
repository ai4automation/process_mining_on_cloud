var express = require('express');
var router = express.Router();
var get_bpmn = require('../services/prom_services/get_bpmn');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var path = require('path')

var storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, 'prom/eventlogs')
    },
    filename: function(req, file, callback) {
        callback(null, path.basename(file.originalname,path.extname(file.originalname)) + '-' + Date.now() + path.extname(file.originalname))
        //callback(null, file.originalname)
    }
})

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var upload = multer({
		storage: storage
	}).single('eventlog')

router.post('/pm_as_service/get_bpmn', upload,get_bpmn.invoke);

module.exports = router;
