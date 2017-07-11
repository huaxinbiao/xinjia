var express = require('express');
var router = express.Router();
var AdmincConst = require('../conf/AdmincConst.js');
const crypto = require('crypto');//加密密码
const validator = require('validator');//表单验证
const Basic = require('../models/basic.js');
const Page = require('../models/page.js');
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
		ification: ification_id
	};
	var screem = {};
	Basic.findOne('download_file', opation, screem, function(err, result){
		if(err){
			return res.redirect('/admin/404');
		}
		if(result){
			return res.json({
				code: 101,
				msg: '分类下存在文件，请先删除文件。'
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
	//输出分类
	Basic.findData('download_ification', {delete: 0}, {describe: 0}, function(err, result){
		if(err){
			return res.redirect('/admin/404');
		}
		res.render('admin/download/addfile', {
			bodyclass: null,
			ification_list: result
		});
	})
})



/**
 * 添加文件
 * @method addfile
 * @param {String} download_file 数据库文档
 * @param {String} title 标题
 * @param {String} describe 描述
 * @param {String} file_src 文件地址
 * @param {String} time 添加时间
 * @return {Null}
 *
 */
router.post('/addfile', function(req, res, next) {
	if(!validator.isByteLength(req.body.title, {min:1, max:100}) || !validator.isByteLength(req.body.describe, {min:1, max:100})){
		return res.json({
			code: 101,
			msg: '数据不完整'
		});
	}
	if(!req.body.file_src){
		return res.json({
			code: 101,
			msg: '文件不存在'
		});
	}
	if(!req.body.ification){
		return res.json({
			code: 101,
			msg: '请选择分类'
		});
	}
	var data = {
		title: req.body.title,
		describe: req.body.describe,
		file_src: req.body.file_src,
		ification: req.body.ification,
		time: new Date().getTime().toString()
	}
	Basic.insertOne('download_file', data, function(err, result){
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




/**
 * 文件列表页
 * @method listfile
 * @param {String} download_file 分类数据库文档
 *@param {String} type 文章分类，为1，全部分类
 */
router.get('/listfile/:type', function(req, res, next) {
	//opation搜索where条件
	//screem指定那些列显示和不显示 （0表示不显示 1表示显示)
	var page = req.query.page ? req.query.page : '1';
	if(!validator.isNumeric(page)){
		page = 1;
	}
	page = parseInt(page);
	//输出分类
	Basic.findData('download_ification', {delete: 0}, {describe: 0}, function(err, result){
		if(err){
			return res.redirect('/admin/404');
		}
		var opation = {}
		if(req.params.type != 1){
			opation.ification = req.params.type;
		}
		var strip = 20;
		Page.find('download_file', opation, {}, page, strip, function(err1, docs, total){
			if(err1){
				return res.redirect('/admin/404');
			}
			res.render('admin/download/listfile', {
				bodyclass: null,
				result: docs,
				page: Math.ceil(total / strip),
				curr: page,
				ification_list: result,
				ification: req.params.type,
				formatDateTime: Function.formatDateTime
			});
		})
	})
});




/*
 * 编辑文件信息页
 * @param {String} download_file
 */
router.get('/editfile', function(req, res, next) {
	var file_id = req.query.file_id;
	if(!validator.isByteLength(file_id, {min:24, max:24})){
		return res.redirect('/admin/404');
	}
	
	//输出分类
	Basic.findData('download_ification', {delete: 0}, {describe: 0}, function(err1, result1){
		if(err1){
			return res.redirect('/admin/404');
		}
		//opation搜索where条件
		//screem指定那些列显示和不显示 （0表示不显示 1表示显示)
		var opation = {
			_id: ObjectID(file_id)
		};
		var screem = {};
		Basic.findOne('download_file', opation, screem, function(err, result){
			if(err){
				return res.redirect('/admin/404');
			}
			res.render('admin/download/editfile', {
				bodyclass: null,
				ification_list: result1,
				result: result
			});
		})
	})
});




/*
 * 编辑文件信息
 * @param {String} ification_id 分类id
 */
router.post('/editfile', function(req, res, next) {
	var file_id = req.body.file_id;
	if(!validator.isByteLength(file_id, {min:24, max:24})){
		return res.json({
			code: 101,
			msg: '参数错误'
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
		file_src: req.body.file_src,
		ification: req.body.ification,
		time: new Date().getTime().toString()
	}
	//更新分类信息；
	Basic.updateOne('download_file', {_id: ObjectID(file_id)}, data, function(err, result){
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
 * 删除文件
 * @param {String} file 文件id
 */
router.post('/delfile', function(req, res, next) {
	//articlecollection,储存所有的文章id,标题，所属分类id
	//opation搜索where条件
	//screem指定那些列显示和不显示 （0表示不显示 1表示显示)
	var file_id = req.body.file_id;
	if(!file_id){
		return res.json({
			code: 101,
			msg: '文件不存在'
		});
	}
	//删除articlecollection中的文章
	Basic.deleteData('download_file', {_id: ObjectID(file_id)}, 1, function(err, result){
		if(err){
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






module.exports = router;