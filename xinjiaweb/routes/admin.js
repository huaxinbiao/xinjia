var express = require('express');
var router = express.Router();
var AdmincConst = require('../conf/AdmincConst.js');
const crypto = require('crypto');//加密密码
const validator = require('validator');//表单验证
const Basic = require('../models/basic.js');
const Page = require('../models/page.js');
const ObjectID = require('mongodb').ObjectID;
const Function = require('../models/function.js')
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
			return res.redirect('/admin/index');
		}
		return next();
	}
	if(!user){
	  	return res.redirect('/');
	}
	next();
});





//404
router.get('/404', function(req, res, next) {
	res.send('页面访问错误，您访问的内容不存在！');
});


//登录页面
router.get('/login', function(req, res, next) {
	res.render('admin/login/index', {
		bodyclass: 'beg-login-bg'
	});
  	//res.send('respond with a resource');
});




//登录
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




//添加文章分类页
router.get('/article/addification', function(req, res, next) {
	res.render('admin/article/addification', {
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




//文章分类列表页
router.get('/article/listification', function(req, res, next) {
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
		res.render('admin/article/listification', {
			bodyclass: null,
			result: result
		});
	})
});




/*
 * 编辑文章分类页
 * @param {String} ification_id 分类id
 */
router.get('/article/editification', function(req, res, next) {
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
	Basic.findOne('ification', opation, screem, function(err, result){
		if(err){
			return res.redirect('/admin/404');
		}
		res.render('admin/article/editification', {
			bodyclass: null,
			result: result
		});
	})
});





/*
 * 编辑文章分类
 * @param {String} ification_id 分类id
 */
router.post('/article/editification', function(req, res, next) {
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
	Basic.updateOne('ification', {_id: ObjectID(ification_id)}, data, function(err, result){
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
 * 删除文章分类，先判断下面有无文章
 * @param {String} ification_id 分类id
 */
router.post('/article/delification', function(req, res, next) {
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
	Basic.findData('articlecollection', opation, screem, function(err, result){
		if(err){
			return res.redirect('/admin/404');
		}
		if(result.length > 0){
			return res.json({
				code: 101,
				msg: '分类下存在文章，请先删除文章。'
			});
		}
		//分类下不存在文章，逻辑删除分类；
		Basic.updateOne('ification', {_id: ObjectID(ification_id)}, {delete: 1}, function(err1, result1){
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




/**
 * 添加文章页
 * @method addArticle
 * @param {String} ification 分类数据库文档
 * @param {String} delete 分类逻辑删除 0否 1是
 *
 */
router.get('/article/addarticle', function(req, res, next) {
	//opation搜索where条件
	//screem指定那些列显示和不显示 （0表示不显示 1表示显示)
	var opation = {
		delete: 0
	};
	var screem = {
		describe: 0
	};
	Basic.findData('ification', opation, screem, function(err, result){
		if(err){
			return res.redirect('/admin/404');
		}
		//输出分类
		res.render('admin/article/addarticle', {
			bodyclass: null,
			result: result
		});
	})
});




/**
 * 添加文章
 * @method addArticle
 * @param {String} ification 分类数据库文档
 * @param {String} delete 分类逻辑删除 0否 1是
 *
 */
router.post('/article/addarticle', function(req, res, next) {
	var ification_id = req.body.ification;
	if(!validator.isByteLength(ification_id, {min:24, max:24})){
		return res.json({
			code: 101,
			msg: '分类id错误'
		});
	}
	if(!req.body.label){
		return res.json({
			code: 101,
			msg: '文章标签错误'
		});
	}
	if(!validator.isByteLength(req.body.title, {min:1, max:150}) || !validator.isByteLength(req.body.briefing, {max:150}) || !validator.isByteLength(req.body.keywords, {max:150}) || !validator.isByteLength(req.body.author, {max:50}) || !validator.isByteLength(req.body.content, {max:30000})){
		return res.json({
			code: 101,
			msg: '数据不完整'
		});
	}
	var opation = {
		_id: ObjectID(ification_id)
	};
	var screem = {
		title: 1
	};
	Basic.findOne('ification', opation, screem, function(err, result){
		if(err || !result){
			return res.json({
				code: 101,
				msg: '分类id错误'
			});
		}
		//分类存在，添加文章
		/*
		 * title，文章标题
		 * briefing，文章简介
		 * author，文章作者
		 * ification，所属分类
		 * content，文章内容
		 * label，文章标签,1为成功案例，2为实用信息
		 * time，文章添加时间
		 * keywords，页面关键字
		 */
		var data = {
			title: req.body.title,
			briefing: req.body.briefing,
			author: req.body.author,
			ification:  req.body.ification,
			label: req.body.label,
			keywords: req.body.keywords,
			time: new Date().getTime().toString()
		}
		Basic.insertOne(AdmincConst.SOLPREFIX + ification_id, data, function(err1, result1){
			if(err1){
				return res.json({
					code: 101,
					msg: '添加失败'
				});
			}
			/*
			 * articlecollection,储存所有的文章id,标题，所属分类id
			 * article_id，文章id
			 * briefing，文章简介
			 * title，文章标题
			 * ification_id，分类id
			 * ification_title,分类名称
			 */
			var data_collection = {
				article_id: result1.ops[0]._id,
				title: req.body.title,
				briefing: req.body.briefing,
				author: req.body.author,
				label: req.body.label,
				ification_id: ification_id,
				ification_title: result.title,
				time: new Date().getTime().toString()
			}
			Basic.insertOne('articlecollection', data_collection, function(err2, result2){
				if(err2){
					return res.json({
						code: 101,
						msg: '添加失败'
					});
				}
				res.status(200);
		    	return res.json({
					code: 200,
					msg: '添加成功'
				});
			})
		})
	})
});




/**
 * 文章列表页
 * @method listArticle
 * @param {String} ification 分类数据库文档
 * @param {String} delete 分类逻辑删除 0否 1是
 *@param {String} type 文章分类，为1，全部分类
 */
router.get('/article/listarticle/:type', function(req, res, next) {
	//opation搜索where条件
	//screem指定那些列显示和不显示 （0表示不显示 1表示显示)
	var page = req.query.page ? req.query.page : '1';
	if(!validator.isNumeric(page)){
		res.redirect('/admin/article/listarticle/1');
	}
	page = parseInt(page);
	var opation = {}
	if(req.params.type != 1){
		opation.ification_id = req.params.type;
	}
	var strip = 20;
	Page.find('articlecollection', opation, {}, page, strip, function(err, docs, total){
		if(err){
			return res.redirect('/admin/404');
		}
		res.render('admin/article/listarticle', {
			bodyclass: null,
			result: docs,
			page: total/strip,
			curr: page,
			ification: req.params.type,
			formatDateTime: Function.formatDateTime
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
	var Route_type = ['ification_img', 'file'];
	var type = req.query.type;
	if(!type || Route_type.indexOf(type) == -1){
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
		if(type == 'file'){
			createFolder('./uploads/article/');
			var d = new Date();
			var str = d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
			uploadFolder = './uploads/article/'+str+'/';
			console.log(uploadFolder);
		}
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
				if(type == 'file'){
					//文章编辑器
					res.status(200);
		        	return res.json({
						code: 0,
						data: {
							src: req.headers.origin+'/'+newPath,
							title: req.headers.origin
						},
						msg: '上传成功'
					});
				}
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
