var express = require('express');
var router = express.Router();
var AdmincConst = require('../conf/AdmincConst.js');

/* GET users listing. */
router.get('/', function(req, res, next) {
		res.render('admin/login/index');
  	//res.send('respond with a resource');
});

router.post('/login', function(req, res, next){
		if(req.body){
			console.log(AdmincConst)
		}
})

module.exports = router;
