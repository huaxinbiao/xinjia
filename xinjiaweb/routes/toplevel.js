var express = require('express');
var router = express.Router();
var AdmincConst = require('../conf/AdmincConst.js');
const crypto = require('crypto');//加密密码
const validator = require('validator');//表单验证
const Basic = require('../models/basic.js');
const ObjectID = require('mongodb').ObjectID;
const Function = require('../models/function.js');


//添加网站模块，成功案例，实用信息
router.get('/nav/:index', function(req, res, next){
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
				toplevel: result1&&result1.ification?result1.ification:[],
				type: req.params.index
			});
		})
	})
})



//添加网站模块，成功案例，实用信息
router.post('/nav', function(req, res, next){
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




//专业特长管理
router.get('/professional', function(req, res, next){
	var opation = {
		delete: 0
	};
	var screem = {};
	Basic.findData('ification', opation, screem, function(err, result){
		if(err){
			return res.redirect('/admin/404');
		}
		Basic.findOne('toplevel', {type: 'professional'}, {}, function(err1, result1){
			if(err1){
				return res.redirect('/admin/404');
			}
			
			if(result1&&result1.professional.length>0){
				var topleveldata = result1.professional;
			}else{
				var topleveldata = [
					['', '', []],
					['', '', []],
					['', '', []],
					['', '', []],
				];
			}
			res.render('admin/toplevel/professional', {
				bodyclass: null,
				result: result,
				toplevel: topleveldata
			});
		})
	})
})

//专业特长添加修改
router.post('/professional', function(req, res, next){
	//opation搜索where条件
	//screem指定那些列显示和不显示 （0表示不显示 1表示显示)
	if(req.body.type!='professional'){
		return res.json({
			code: 101,
			msg: '数据不正确'
		});
	}
	var typeofArr = function(obj){
		if(typeof obj=='string'){
			let arr = [];
			arr.push(obj)
			obj = arr;
		}else if(typeof obj=='undefined'){
			obj = []
		}
		return obj
	};
	var professional = [
		[req.body.title1, req.body.describe1, typeofArr(req.body.ification1)],
		[req.body.title2, req.body.describe2, typeofArr(req.body.ification2)],
		[req.body.title3, req.body.describe3, typeofArr(req.body.ification3)],
		[req.body.title4, req.body.describe4, typeofArr(req.body.ification4)]
	];
	var data = {
		professional: professional,
		type: req.body.type,
		time: new Date().getTime().toString()
	}
	
	//更新分类信息；
	Basic.updateOne('toplevel', {type: 'professional'}, data, function(err, result){
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




//法律知识管理
router.get('/law', function(req, res, next){
	var opation = {
		delete: 0
	};
	var screem = {};
	Basic.findData('ification', opation, screem, function(err, result){
		if(err){
			return res.redirect('/admin/404');
		}
		Basic.findOne('toplevel', {type: 'law'}, {}, function(err1, result1){
			if(err1){
				return res.redirect('/admin/404');
			}
			
			if(result1&&result1.professional.length>0){
				var topleveldata = result1.professional;
			}else{
				var topleveldata = [
					['', '', ''],
					['', '', ''],
					['', '', ''],
					['', '', ''],
					['', '', ''],
					['', '', '']
				];
			}
			res.render('admin/toplevel/law', {
				bodyclass: null,
				result: result,
				toplevel: topleveldata
			});
		})
	})
})

//法律知识添加修改
router.post('/law', function(req, res, next){
	//opation搜索where条件
	//screem指定那些列显示和不显示 （0表示不显示 1表示显示)
	if(req.body.type!='law'){
		return res.json({
			code: 101,
			msg: '数据不正确'
		});
	}
	var law = [
		[req.body.title1, req.body.describe1, req.body.ification1],
		[req.body.title2, req.body.describe2, req.body.ification2],
		[req.body.title3, req.body.describe3, req.body.ification3],
		[req.body.title4, req.body.describe4, req.body.ification4],
		[req.body.title5, req.body.describe5, req.body.ification5],
		[req.body.title6, req.body.describe6, req.body.ification6]
	];
	var data = {
		professional: law,
		type: req.body.type,
		time: new Date().getTime().toString()
	}
	
	//更新分类信息；
	Basic.updateOne('toplevel', {type: 'law'}, data, function(err, result){
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