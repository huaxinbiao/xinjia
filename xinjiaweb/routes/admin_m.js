var express = require('express');
var router = express.Router();
var AdmincConst = require('../conf/AdmincConst.js');
const crypto = require('crypto');//加密密码
const validator = require('validator');//表单验证
const Basic = require('../models/basic.js');
const ObjectID = require('mongodb').ObjectID;
const Function = require('../models/function.js');

router.get('/', function(req, res, next){
	return res.redirect('/admin/404');
})




module.exports = router;