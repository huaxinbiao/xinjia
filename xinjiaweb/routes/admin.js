var express = require('express');
var router = express.Router();
var AdmincConst = require('../conf/AdmincConst.js');
const crypto = require('crypto');//加密密码
const validator = require('validator');//表单验证

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


module.exports = router;
