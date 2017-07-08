var express = require('express');
var router = express.Router();
var AdmincConst = require('../conf/AdmincConst.js');
const crypto = require('crypto');//加密密码
const validator = require('validator');//表单验证
const Basic = require('../models/basic.js');
const ObjectID = require('mongodb').ObjectID;
const Function = require('../models/function.js');


//添加网站模块，成功案例，实用信息
router.get('/:index', function(req, res, next){
	//opation搜索where条件
	//screem指定那些列显示和不显示 （0表示不显示 1表示显示)
	
	var opation = {
		delete: 0
	};
	var screem = {};
	Basic.findData('ification', opation, screem, function(err, result){
		if(err){
			return res.redirect('/admin/404');
		}
		Basic.findOne('toplevel', {type: req.params.index}, {}, function(err1, result1){
			if(err1){
				return res.redirect('/admin/404');
			}
			res.render('admin/toplevel/index', {
				bodyclass: null,
				result: result,
				toplevel: result1.ification?result1.ification:[],
				type: req.params.index
			});
		})
	})
})



//添加网站模块，成功案例，实用信息
router.post('/', function(req, res, next){
	//opation搜索where条件
	//screem指定那些列显示和不显示 （0表示不显示 1表示显示)
	if(req.body.type!=1 && req.body.type!=2){
		return res.json({
			code: 101,
			msg: '数据不正确'
		});
	}
	
	var data = {
		title: req.body.type == 1 ? '成功案例' : '实用信息',
		ification: req.body.ification,
		type: req.body.type,
		time: new Date().getTime().toString()
	}
	if(typeof data.ification=='string'){
		var arr = [];
		arr.push(data.ification)
		data.ification = arr;
	}
	//更新分类信息；
	Basic.updateOne('toplevel', {type: req.body.type}, data, function(err, result){
		if(err){
			return res.json({
				code: 101,
				msg: '保存失败'
			});
		}
		res.status(200);
    	return res.json({
			code: 200,
			msg: '保存成功'
		});
	})
})




module.exports = router;