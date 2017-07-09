var express = require('express');
var router = express.Router();
var AdmincConst = require('../conf/AdmincConst.js');
const crypto = require('crypto'); //加密密码
const validator = require('validator'); //表单验证
const Basic = require('../models/basic.js');
const Page = require('../models/page.js');
const ObjectID = require('mongodb').ObjectID;
const Function = require('../models/function.js');

/* GET home page. */
/**
 * 首页
 * @method /
 * @param {String} ification 分类数据库文档
 * @param {String} delete 分类逻辑删除 0否 1是
 * @param {Object} ification 输出的分类
 *
 */
router.get('/index', function(req, res, next) {
	res.redirect('/');
})
router.get('/', function(req, res, next) {
	//toplevel，查找成功案例下的分类
	Basic.findOne('toplevel', {
		type: '1'
	}, {}, function(err, result) {
		if(err) {
			return res.redirect('/404');
		}
		let objId = [];
		for(let key in result.ification) {
			objId.push(ObjectID(result.ification[key]))
		}
		//获取分类列表
		Basic.findData('ification', {
			_id: {
				"$in": objId
			},
			delete: 0
		}, {
			title: 1,
			describe: 1
		}, function(err, result1) {
			if(err) {
				return res.redirect('/404');
			}
			res.render('web/index/index', {
				title: '信嘉法律房产咨询',
				ification: result1
			});
		})
	})
});

/**
 * 分类列表页
 * @method index/list
 * @param {String} ification 分类数据库文档
 * @param {String} delete 分类逻辑删除 0否 1是
 * @param {Object} ification 输出的分类
 */
router.get('/index/ification', function(req, res, next) {
	return res.redirect('/index/ification/index');
})
router.get('/index/ification/:type', function(req, res, next) {
	if(req.params.type != 1 && req.params.type != 2 && req.params.type != 'index') {
		return res.redirect('/index/ification/index');
	}
	if(req.params.type == 1 || req.params.type == 2){
		//toplevel，查找分类
		Basic.findOne('toplevel', {
			type: req.params.type
		}, {}, function(err, result) {
			if(err) {
				return res.redirect('/404');
			}
			let objId = [];
			for(let key in result.ification) {
				objId.push(ObjectID(result.ification[key]))
			}
			//获取分类列表
			Basic.findData('ification', {
				_id: {
					"$in": objId
				},
				delete: 0
			}, {}, function(err1, result1) {
				if(err1) {
					return res.redirect('/404');
				}
				//获取分类下的文章
				let objId = [];
				for(let key in result1) {
					objId.push(result1[key]._id.toString());
				}
				//查找文章
				Basic.findData('articlecollection', {
					ification_id: {
						"$in": objId
					},
					label: req.params.type
				}, {}, function(err2, result2) {
					if(err2) {
						return res.redirect('/404');
					}
					//获取分类下的文章
					res.render('web/article/ification', {
						title: '信嘉法律房产咨询',
						type: req.params.type,
						ification: result1,
						article: result2
					});
				})
			})
		})
	}else{
		Basic.findData('ification', {
			delete: 0
		}, {}, function(err, result) {
			if(err) {
				return res.redirect('/404');
			}
			let objId = [];
			for(let key in result) {
				objId.push(result[key]._id.toString());
			}
			Page.findData('articlecollection', {
				ification_id: {
					"$in": objId
				}
			}, {}, 1, 1, function(err1, result1) {
				
			})
			//查找文章
			Basic.findData('articlecollection', {
				ification_id: {
					"$in": objId
				}
			}, {}, function(err1, result1) {
				if(err1) {
					return res.redirect('/404');
				}
				//获取分类下的文章
				res.render('web/article/ification', {
					title: '信嘉法律房产咨询',
					type: req.params.type,
					ification: result,
					article: result1
				});
			})
		})
		
	}
})





/**
 * 文章列表页
 * @method index/list
 * @param {String} ification 分类数据库文档
 * @param {String} delete 分类逻辑删除 0否 1是
 * @param {Object} ification 输出的分类
 */
router.get('/index/list', function(req, res, next) {
	return res.redirect('/index/list/index');
})
router.get('/index/list/:type', function(req, res, next) {
	if(req.params.type != 1 && req.params.type != 2 && req.params.type != 'index') {
		return res.redirect('/index/list/index');
	}
	Basic.findOne('ification', {
		delete: 0
	}, {}, function(err, result) {
		if(err) {
			return res.redirect('/404');
		}
		return res.redirect('/index/list/'+req.params.type+'/'+result._id);
	})
})
router.get('/index/list/:type/:ification', function(req, res, next) {
	var page = req.query.page ? req.query.page : '1';
	if(req.params.type != 1 && req.params.type != 2 && req.params.type != 'index') {
		return res.redirect('/index/list');
	}
	//opation搜索where条件
	//screem指定那些列显示和不显示 （0表示不显示 1表示显示)
	if(req.params.type == 1 || req.params.type == 2) {
		var opation = {
			type: req.params.type
		};
		//toplevel，查找分类
		Basic.findOne('toplevel', opation, {}, function(err, result) {
			if(err) {
				return res.redirect('/404');
			}
			let objId = [];
			for(let key in result.ification) {
				objId.push(ObjectID(result.ification[key]))
			}
			//获取分类列表
			Basic.findData('ification', {
				_id: {
					"$in": objId
				},
				delete: 0
			}, {}, function(err1, result1) {
				if(err1) {
					return res.redirect('/404');
				}
				//获取分类下的文章
				var opation1 = {
					ification_id: req.params.ification
				}
				if(req.query.label == 1 || req.query.label == 2) {
					opation1.label = req.query.label
				}
				var strip = 20;
				Page.find('articlecollection', opation1, {}, page, strip, function(err2, docs, total) {
					if(err2) {
						return res.redirect('/404');
					}
					res.render('web/article/list', {
						title: '信嘉法律房产咨询',
						ification: result1,
						article: docs,
						type: req.params.type,
						label: req.query.label,
						page: total / strip,
						curr: page,
						ification_curr: req.params.ification,
						formatDateTime: Function.formatDateTime
					});
				})
			})
		})
	} else if(req.params.type == 'index') {
		var opation = {
			delete: 0
		};
		Basic.findData('ification', opation, {}, function(err, result) {
			if(err) {
				return res.redirect('/404');
			}
			//获取分类下的文章
			var opation1 = {
				ification_id: req.params.ification
			}
			if(req.query.label == 1 || req.query.label == 2) {
				opation1.label = req.query.label
			}
			var strip = 20;
			Page.find('articlecollection', opation1, {}, page, strip, function(err2, docs, total) {
				if(err2) {
					return res.redirect('/404');
				}
				res.render('web/article/list', {
					title: '信嘉法律房产咨询',
					ification: result,
					article: docs,
					type: req.params.type,
					label: req.query.label,
					page: total / strip,
					curr: page,
					ification_curr: req.params.ification,
					formatDateTime: Function.formatDateTime
				});
			})
		})
	}
});

module.exports = router;