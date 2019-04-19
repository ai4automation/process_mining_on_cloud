var express = require('express');
var router = express.Router();
var get_bpmn = require('../services/prom_services/get_bpmn');
var get_pnml= require('../services/prom_services/get_pnml');
var get_baw_data= require('../services/data_services/get_baw_data');
var convert2pnml = require('../services/prom_services/convertbpmn2petrinet.js');
var learn_trie_representation = require('../services/representation_learning/trie_representation.js');

var multer = require('multer');
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

var bpmn_storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, 'prom/input_bpmn_files')
    },
    filename: function(req, file, callback) {
        callback(null, path.basename(file.originalname,path.extname(file.originalname)) + '-' + Date.now() + ".bpmn")
        //callback(null, file.originalname)
    }
})

var activity_timeseries_storage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, 'uploads/')
    },
    filename: function(req, file, callback) {
        callback(null, path.basename(file.originalname,path.extname(file.originalname)) + '-' + Date.now() + ".json")
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

var bpmn_upload = multer({
        storage: bpmn_storage
}).single('bpmn_model_file')

var activity_timeseries_upload = multer({
        storage: activity_timeseries_storage
}).single('file')

router.post('/mine_bpmn_model', upload,get_bpmn.invoke);
router.post('/mine_pn_model', upload,get_pnml.invoke);
router.post('/convert_to_pnml', bpmn_upload,convert2pnml.invoke);
router.post('/convert_to_dfg', bpmn_upload,convert2pnml.get_dfg_representation);
router.get('/get_baw_model',get_baw_data.get_model);
router.get('/get_bai_activity_timeseries',get_baw_data.get_activity_timeseries);

router.post('/learn_trie_representation',activity_timeseries_upload,learn_trie_representation.invoke);


module.exports = router;
