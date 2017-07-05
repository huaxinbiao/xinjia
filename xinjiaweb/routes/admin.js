var express = require('express');
var router = express.Router();
var AdmincConst = require('../conf/AdmincConst.js');
const crypto = require('crypto');//加密密码
const validator = require('validator');//表单验证
const Basic = require('../models/basic.js');
const ObjectID = require('mongodb').ObjectID;
//文件上传
const muilter = require('../models/multerUtil.js');
const path = require('path');
const fs = require('fs');
//图片裁切
//const images = require("images");
//回调
const Promise = require('bluebird');

/* GET users listing. */
//权限控制
router.all('*', function(req, res, next){
	let url = req.url.split("?")[0];
	var Route = ['/login'];
	var user = req.session.user;
	if(Route.indexOf(url) > -1){
		if(user){
			res.redirect('/admin/index');
		}
		return next();
	}
	if(!user){
	  	res.redirect('/');
	}
	next();
});

//登录
router.get('/login', function(req, res, next) {
	res.render('admin/login/index', {
		bodyclass: 'beg-login-bg'
	});
  	//res.send('respond with a resource');
});
router.post('/login', function(req, res, next){
    if(!new RegExp("^[a-zA-Z0-9_\u4e00-\u9fa5\\s·]+$").test(req.body.userName) || /(^\_)|(\__)|(\_+$)/.test(req.body.userName)){
      	return res.json({
			code: 103,
			msg: '账号或密码错误'
		});
    }
	if(!validator.isLength(req.body.password, {min:6,max:12})){
		return res.json({
			code: 103,
			msg: '账号或密码错误'
		});
	}
	//生成密码MD5
	let password = crypto.createHash('md5').update(req.body.password).digest('hex');
	let g_password = crypto.createHash('md5').update(AdmincConst.PASSWORD).digest('hex');
	if(req.body.userName != AdmincConst.NAME){
		return res.json({
			code: 103,
			msg: '账号或密码错误'
		});
	}
	if(password != g_password){
		return res.json({
			code: 103,
			msg: '账号或密码错误'
		});
	}
	//用户信息存入session
	req.session.user = {
		name: req.body.userName,
		password: password
	};
	res.json({
		code: 200,
		msg: '登录成功'
	});
	//res.redirect('/index');
})

//首页
router.get('/index', function(req, res, next) {
	res.render('admin/index/index', {
		bodyclass: null
	});
  	//res.send('respond with a resource');
});

//退出登录
router.get('/outlogin', function(req, res){
	req.session.user = null;
	res.redirect('/admin/login');
})

//欢迎页
router.get('/main', function(req, res, next) {
	res.render('admin/index/main');
  	//res.send('respond with a resource');
});

//文章分类页
router.get('/article/ification', function(req, res, next) {
	res.render('admin/article/ification', {
		bodyclass: null
	});
});

/**
 * 添加文章分类
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
router.post('/article/addification', function(req, res, next) {
	if(!validator.isByteLength(req.body.title, {min:1, max:100}) || !validator.isByteLength(req.body.describe, {min:1, max:100})){
		return res.json({
			code: 101,
			msg: '数据不全'
		});
	}
	
	var data = {
		title: req.body.title,
		describe: req.body.describe,
		ification_banner: req.body.ification_banner,
		delete: 0,
		time: new Date().getTime().toString()
	}
	Basic.insertOne('ification', data, function(err, result){
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

//文件上传
router.post('/upload', function(req, res) {
	var user = req.session.user;
	if(!user){
		return res.json({
			code: 104,
			msg: '请先登录'
		});
	}
	var type = req.query.type;
	if(!type){
		return res.json({
			code: 101,
			msg: '参数错误'
		});
	}
	var upload=muilter.single(type);
    upload(req, res, function (err) {
	    //添加错误处理
	    if (err) {
	        return  console.log(err);
	    }
	    // 没有附带文件
	  	if (!req.file) {
		    return res.json({
				code: 101,
				msg: '文件不存在'
			});
	  	}
	  	//后缀名
	  	var extName = ''; 
	    switch (req.file.mimetype) {
	        case 'image/pjpeg':
	            extName = 'jpg';
	            break;
	        case 'image/jpeg':
	            extName = 'jpg';
	            break;
	        case 'image/png':
	            extName = 'png';
	            break;
	        case 'image/x-png':
	            extName = 'png';
	            break;
	    }
	    if (extName.length === 0) {
	    	return res.json({
				code: 101,
				msg: '图片格式不正确'
			});
	    }
		//新建文件夹
		var createFolder = function(dirName){
		    try{
		        fs.accessSync(dirName, fs.F_OK);
		    }catch(e){
		        fs.mkdirSync(dirName);
		    }
		};
		
		var uploadFolder = './uploads/ification/';
		createFolder(uploadFolder)
		// 移动文件
	  	let oldPath = path.join(req.file.path);
	  	let newPath = path.join(uploadFolder, req.file.filename);
	  	fs.rename(oldPath, newPath, (err) => {
		    if (err) {
		      	console.log(err);
	        	return res.json({
					code: 101,
					msg: '上传失败'
				});
		    } else {
				res.status(200);
	        	return res.json({
					code: 200,
					data: {
						orihead: '/'+newPath
					},
					msg: '上传成功'
				});
		    }
	  	});
	  	
	  	// 输出文件信息
	  	/*console.log('====================================================');
	  	console.log('fieldname: ' + req.file.fieldname);
	  	console.log('originalname: ' + req.file.originalname);
	  	console.log('encoding: ' + req.file.encoding);
	  	console.log('mimetype: ' + req.file.mimetype);
	  	console.log('size: ' + (req.file.size / 1024).toFixed(2) + 'KB');
	  	console.log('destination: ' + req.file.destination);
	  	console.log('filename: ' + req.file.filename);
	  	console.log('path: ' + req.file.path);*/
  	});
});

module.exports = router;
