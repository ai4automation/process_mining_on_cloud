var fs = require("fs")

var get_baw_data = {
	get_model: function (req, res, next) {
    console.log(JSON.stringify(req.query))
		 processApplicationId = req.query.processApplicationId
     processVersionId = req.query.processVersionId;
     m_path = 'data/'+processApplicationId+"/"+processVersionId+"/model.bpmn"
     fs.readFile(m_path, 'utf8', function (err,data) {
         res.send(data);
     });

	},
  get_activity_timeseries: function (req, res, next) {
		 processApplicationId = req.query.processApplicationId
     processVersionId = req.query.processVersionId;
     d_path = 'data/'+processApplicationId+"/"+processVersionId+"/bai.json"
     fs.readFile(d_path, 'utf8', function (err,data) {
         res.send(data);
     });
   }
}
module.exports = get_baw_data;
