var express = require('express');
var router = express.Router();
var AdmincConst = require('../conf/AdmincConst.js');
const crypto = require('crypto');//加密密码
const validator = require('validator');//表单验证
const Basic = require('../models/basic.js');
const ObjectID = require('mongodb').ObjectID;
const Function = require('../models/function.js');

/*
 * 文件下载路由文件
 */



//添加下载分类页
router.get('/addification', function(req, res, next){
	res.render('admin/download/addification', {
		bodyclass: null
	});
})



/**
 * 添加文件分类
 * @method addification
 * @param {String} ification 数据库文档
 * @param {String} title 标题
 * @param {String} describe 描述
 * @param {String} ification_banner 图片地址
 * @param {String} delete 逻辑删除 0否 1是
 * @param {String} time 添加时间
 * @return {Null}
 *
 */
router.post('/addification', function(req, res, next) {
	if(!validator.isByteLength(req.body.title, {min:1, max:100}) || !validator.isByteLength(req.body.describe, {min:1, max:100})){
		return res.json({
			code: 101,
			msg: '数据不完整'
		});
	}
	
	var data = {
		title: req.body.title,
		describe: req.body.describe,
		ification_banner: req.body.ification_banner,
		delete: 0,
		time: new Date().getTime().toString()
	}
	Basic.insertOne('download_ification', data, function(err, result){
		if(err){
			return res.json({
				code: 101,
				msg: '添加失败'
			});
		}
		res.status(200);
    	return res.json({
			code: 200,
			data: {
				result: result
			},
			msg: '添加成功'
		});
	})
});





//文件分类列表页
router.get('/listification', function(req, res, next) {
	//opation搜索where条件
	//screem指定那些列显示和不显示 （0表示不显示 1表示显示)
	var opation = {
		delete: 0
	};
	var screem = {};
	Basic.findData('download_ification', opation, screem, function(err, result){
		if(err){
			return res.redirect('/admin/404');
		}
		res.render('admin/download/listification', {
			bodyclass: null,
			result: result
		});
	})
});




/*
 * 编辑文件分类页
 * @param {String} ification_id 分类id
 */
router.get('/editification', function(req, res, next) {
	var ification_id = req.query.ification_id;
	if(!validator.isByteLength(ification_id, {min:24, max:24})){
		return res.redirect('/admin/404');
	}
	
	//opation搜索where条件
	//screem指定那些列显示和不显示 （0表示不显示 1表示显示)
	var opation = {
		_id: ObjectID(ification_id)
	};
	var screem = {};
	Basic.findOne('download_ification', opation, screem, function(err, result){
		if(err){
			return res.redirect('/admin/404');
		}
		res.render('admin/download/editification', {
			bodyclass: null,
			result: result
		});
	})
});




/*
 * 编辑文件分类
 * @param {String} ification_id 分类id
 */
router.post('/editification', function(req, res, next) {
	var ification_id = req.body.ification_id;
	if(!validator.isByteLength(ification_id, {min:24, max:24})){
		return res.json({
			code: 101,
			msg: '分类id错误'
		});
	}
	
	if(!validator.isByteLength(req.body.title, {min:1, max:100}) || !validator.isByteLength(req.body.describe, {min:1, max:100})){
		return res.json({
			code: 101,
			msg: '数据不完整'
		});
	}
	
	var data = {
		title: req.body.title,
		describe: req.body.describe,
		ification_banner: req.body.ification_banner,
		time: new Date().getTime().toString()
	}
	//更新分类信息；
	Basic.updateOne('download_ification', {_id: ObjectID(ification_id)}, data, function(err, result){
		if(err){
			return res.json({
				code: 101,
				msg: '修改失败'
			});
		}
		res.status(200);
    	return res.json({
			code: 200,
			msg: '修改成功'
		});
	})
});




/*
 * 删除文件分类，先判断下面有无文件
 * @param {String} ification_id 分类id
 */
router.post('/delification', function(req, res, next) {
	//articlecollection,储存所有的文章id,标题，所属分类id
	//opation搜索where条件
	//screem指定那些列显示和不显示 （0表示不显示 1表示显示)
	var ification_id = req.body.ification_id;
	if(!ification_id){
		return res.json({
			code: 101,
			msg: '缺少分类'
		});
	}
	var opation = {
		ification_id: ification_id
	};
	var screem = {};
	Basic.findOne('download_file', opation, screem, function(err, result){
		if(err){
			return res.redirect('/admin/404');
		}
		if(result){
			return res.json({
				code: 101,
				msg: '分类下存在文章，请先删除文件。'
			});
		}
		//分类下不存在文件，逻辑删除分类；
		Basic.updateOne('download_ification', {_id: ObjectID(ification_id)}, {delete: 1}, function(err1, result1){
			if(err1){
				return res.json({
					code: 101,
					msg: '删除失败'
				});
			}
			res.status(200);
	    	return res.json({
				code: 200,
				msg: '删除成功'
			});
		})
	})
	
})




//添加文件页
router.get('/addfile', function(req, res, next){
	res.render('admin/download/addfile', {
		bodyclass: null
	});
})





module.exports = router;